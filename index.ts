import * as getPixels from "get-pixels"

function getPixelArray(imagePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        getPixels(imagePath, (err, pixels) => {
            if (err) {
                return reject(err)
            }
            resolve(pixels)
        })
    })
}

async function findImage(image, source) {
    const imageToFind = await getPixelArray(image)
    const imageSource = await getPixelArray(source)
    const [sizeX, sizeY] = imageToFind.shape
    const [sourceSizeX, ySource] = imageSource.shape
    if (sourceSizeX < sizeX || ySource < sizeY) {
        throw new Error('Source image cannot be smaller')
    }
    console.log([sizeX,sizeY],[sourceSizeX,ySource]);
    const parsedToFindArray = []
    for(let iShape = 0; iShape<imageToFind.shape[0]; ++iShape) {
        for(let jShape=0; jShape<imageToFind.shape[1]; ++jShape) {
            const r = imageToFind.get(iShape, jShape, 0)
            const g = imageToFind.get(iShape, jShape, 1)
            const b = imageToFind.get(iShape, jShape, 2)
            parsedToFindArray.push([r,g,b])
        }
    }

    // console.log(cutImage);
    // console.log(imageSource.get(0,0,1))

    const xMax = sourceSizeX - sizeX
    const yMax = ySource - sizeY
    for (let i = 0; i < xMax; i++) {
        for (let j = 0; j < yMax; j++) {
            if (j === 0) {
                console.log(i,j);
            }
            let cutImage = imageSource.hi(sizeX+i,sizeY+j).lo(i, j)
            let parsedArray = []
            let index = 0
            loop1:
            for(let iShape = 0; iShape<cutImage.shape[0]; ++iShape) {
                for(let jShape=0; jShape<cutImage.shape[1]; ++jShape) {
                    const r = cutImage.get(iShape, jShape, 0)
                    const g = cutImage.get(iShape, jShape, 1)
                    const b = cutImage.get(iShape, jShape, 2)
                    if (parsedToFindArray[index][0] !== r || parsedToFindArray[index][1] !== g || parsedToFindArray[index][2] !== b) {
                        break loop1;
                    }
                    index++;
                }
            }

            if (parsedToFindArray.length === index) {
                return {x: i, y: j}
            }
        }
    }
    return false
}

async function test() {
    console.time('test')
    console.log(await findImage("assets/find.png", "assets/source.png"))
    console.timeEnd('test')
}

test()