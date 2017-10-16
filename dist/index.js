"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const getPixels = require("get-pixels");
function rgb2hex(red, green, blue) {
    var rgb = blue | (green << 8) | (red << 16);
    return (0x1000000 + rgb).toString(16).slice(1);
}
function getPixelArray(imagePath) {
    return new Promise((resolve, reject) => {
        getPixels(imagePath, (err, pixels) => {
            if (err) {
                return reject(err);
            }
            resolve(pixels);
        });
    });
}
function findImage(image, source) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageToFind = yield getPixelArray(image);
        const imageSource = yield getPixelArray(source);
        const [x, y] = imageToFind.shape;
        const [xSource, ySource] = imageSource.shape;
        if (xSource < x || ySource < y) {
            throw new Error('Source image cannot be smaller');
        }
        console.log([x, y], [xSource, ySource]);
        const parsedToFindArray = [];
        for (let iShape = 0; iShape < imageToFind.shape[0]; ++iShape) {
            for (let jShape = 0; jShape < imageToFind.shape[1]; ++jShape) {
                const r = imageToFind.get(iShape, jShape, 0);
                const g = imageToFind.get(iShape, jShape, 1);
                const b = imageToFind.get(iShape, jShape, 2);
                parsedToFindArray.push(rgb2hex(r, g, b));
            }
        }
        // console.log(cutImage);
        // console.log(imageSource.get(0,0,1))
        const xMax = xSource - x;
        const yMax = ySource - y;
        for (let i = 0; i < xMax; i++) {
            for (let j = 0; j < yMax; j++) {
                if (j % 30 === 0) {
                    console.log(i, j);
                }
                let cutImage = imageSource.hi(x + i, y + j).lo(i, j);
                let parsedArray = [];
                let index = 0;
                loop1: for (let iShape = 0; iShape < cutImage.shape[0]; ++iShape) {
                    for (let jShape = 0; jShape < cutImage.shape[1]; ++jShape) {
                        const r = cutImage.get(iShape, jShape, 0);
                        const g = cutImage.get(iShape, jShape, 1);
                        const b = cutImage.get(iShape, jShape, 2);
                        if (parsedToFindArray[index] !== rgb2hex(r, g, b)) {
                            break loop1;
                        }
                        index++;
                    }
                }
                if (parsedToFindArray.length === index) {
                    return { x: i, y: j };
                }
            }
        }
        return false;
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(yield findImage("assets/find.png", "assets/source.png"));
    });
}
test();
