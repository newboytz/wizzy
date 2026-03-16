const fs = require('fs')
const path = require('path')
const { tmpdir } = require('os')
const Crypto = require('crypto')
const Jimp = require('jimp')
const { exec } = require('child_process')
const webp = require('node-webpmux')

/**
 * Image to WebP
 */
async function imageToWebp(media) {
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)

    fs.writeFileSync(tmpFileIn, media)

    return new Promise((resolve, reject) => {
        // Tunatumia ffmpeg kwa sababu ni imara zaidi kwenye kupunguza size ya sticker
        exec(`ffmpeg -i ${tmpFileIn} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" -vcodec libwebp ${tmpFileOut}`, (err) => {
            if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
            if (err) return reject(err)
            const buff = fs.readFileSync(tmpFileOut)
            if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
            resolve(buff)
        })
    })
}

/**
 * Video to WebP (GIF Stickers)
 */
async function videoToWebp(media) {
    const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)

    fs.writeFileSync(tmpFileIn, media)

    return new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tmpFileIn} -vcodec libwebp -filter:v "fps=fps=20,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" -lossless 1 -loop 0 -preset default -an -vsync 0 ${tmpFileOut}`, (err) => {
            if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn)
            if (err) return reject(err)
            const buff = fs.readFileSync(tmpFileOut)
            if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut)
            resolve(buff)
        })
    })
}

/**
 * Write Metadata (Exif) kwa Sticker
 */
async function writeExif(media, metadata) {
    let wpb = /video/.test(metadata.mimetype) || metadata.isVid ? await videoToWebp(media) : await imageToWebp(media)
    const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
    const img = new webp.Image()
    
    const json = {
        "sticker-pack-id": `https://github.com/GlobalTechInfo`,
        "sticker-pack-name": metadata.packname || 'MEGA-MD',
        "sticker-pack-publisher": metadata.author || 'Qasim',
        "emojis": metadata.categories || ["✅"]
    }

    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)

    await img.load(wpb)
    img.exif = exif
    await img.save(tmpFileOut)
    return tmpFileOut
}

// Hizi hapa ni kwa ajili ya kuendana na index.js yako
async function writeExifImg(media, metadata) {
    return await writeExif(media, { ...metadata, mimetype: 'image' })
}

async function writeExifVid(media, metadata) {
    return await writeExif(media, { ...metadata, mimetype: 'video' })
}

module.exports = { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif }
                                 
