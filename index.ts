import * as getPixels from "get-pixels"
import * as cluster from "cluster"

export class ImageFinder {
    imageToFindPath: string
    imageToFindInPath: string
    tolerance: number
    tolerancePixels: number
    parsedToFindArray: any[]
    imageToFind: any
    imageSource: any
    constructor(imageToFindPath: string, imageToFindInPath: string, tolerance: number = 0) {
        this.imageToFindPath = imageToFindPath
        this.imageToFindInPath = imageToFindInPath
        this.tolerance = tolerance
        this.parsedToFindArray = []
    }

    getPixelArray(imagePath: string): Promise<any> {
        return new Promise((resolve, reject) => {
            getPixels(imagePath, (err, pixels) => {
                if (err) {
                    return reject(err)
                }
                resolve(pixels)
            })
        })
    }

    checkRect(cutImage) {
        let index = 0
        let invalidPixels = 0
        for(let iShape = 0; iShape<cutImage.shape[0]; ++iShape) {
            for(let jShape = 0; jShape<cutImage.shape[1]; ++jShape) {
                const r = cutImage.get(iShape, jShape, 0)
                const g = cutImage.get(iShape, jShape, 1)
                const b = cutImage.get(iShape, jShape, 2)
                if (this.parsedToFindArray[index][0] !== r || this.parsedToFindArray[index][1] !== g || this.parsedToFindArray[index][2] !== b) {
                    invalidPixels++
                    if (invalidPixels > this.tolerancePixels) {
                        return false
                    }
                }
                index++;
            }
        }
        return true
    }

    checkY(i) {
        const [sizeX, sizeY] = this.imageToFind.shape
        const yMax = this.imageSource.shape[1] - sizeY
        for (let j = 0; j < yMax; j++) {
            let cutImage = this.imageSource.hi(sizeX+i,sizeY+j).lo(i, j)
            if (this.checkRect(cutImage)) {
                return {x: i as number, y: j as number}
            }
        }
        return false
    }

    //Tolerance - percent of invalid pixels
    async findImage() {
        this.imageToFind = await this.getPixelArray(this.imageToFindPath)
        this.imageSource = await this.getPixelArray(this.imageToFindInPath)
        const [sizeX, sizeY] = this.imageToFind.shape
        const [sourceSizeX, ySource] = this.imageSource.shape
        if (sourceSizeX < sizeX || ySource < sizeY) {
            throw new Error('Source image cannot be smaller')
        }

        if (this.parsedToFindArray.length === 0) {
            for(let iShape = 0; iShape<this.imageToFind.shape[0]; ++iShape) {
                for(let jShape=0; jShape<this.imageToFind.shape[1]; ++jShape) {
                    const r = this.imageToFind.get(iShape, jShape, 0)
                    const g = this.imageToFind.get(iShape, jShape, 1)
                    const b = this.imageToFind.get(iShape, jShape, 2)
                    this.parsedToFindArray.push([r,g,b])
                }
            }
        }
        this.tolerancePixels = sizeX*sizeY * (this.tolerance/100)
        const xMax = sourceSizeX - sizeX
        const yMax = ySource - sizeY
        for (let i = 0; i < xMax; i++) {
            const result = this.checkY(i)
            if (result) {
                return result
            }
        }
        return false
    }

}
