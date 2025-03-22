const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const imageDir = "D:/AbhinavTraders/AbhinavTraders/images";
const archiveDir = "D:/AbhinavTraders/AbhinavTraders/archive";
const outputDir = "D:/AbhinavTraders/AbhinavTraders/output";

// Ensure archive and output directories exist
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function watermarkImage(imagePath, outputPath, watermarkText) {
    try {
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Watermark text settings (centered with light opacity)
        const fontSize = Math.floor(metadata.width * 0.08);  // 8% of image width

        const svgWatermark = `
        <svg width="${metadata.width}" height="${metadata.height}">
            <text x="50%" y="50%"
                font-family="Arial"
                font-size="${fontSize}"
                fill="white"
                stroke="black"
                stroke-width="1"
                text-anchor="middle"
                alignment-baseline="middle"
                opacity="0.3">  <!-- Light opacity -->
                ${watermarkText}
            </text>
        </svg>`;

        // Apply watermark
        await image
            .composite([{ input: Buffer.from(svgWatermark), gravity: "center" }])
            .toFile(outputPath);

        console.log(`✅ Watermarked: ${path.basename(outputPath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error watermarking ${imagePath}:`, error.message);
        return false;
    }
}

async function processImages() {
    const files = fs.readdirSync(imageDir).filter(file => /\.(jpe?g|png)$/i.test(file));

    if (files.length === 0) {
        console.log("No new images detected.");
        return;
    }

    console.log(`📷 Processing ${files.length} images...`);

    let imageCount = 1;

    for (const file of files) {
        const imagePath = path.join(imageDir, file);

        // Generate sequential file name (image_1.jpg, image_2.jpg, ...)
        const newFileName = `image_${imageCount}.jpg`;
        const outputPath = path.join(outputDir, newFileName);
        const archivePath = path.join(archiveDir, file);

        const success = await watermarkImage(imagePath, outputPath, "Abhinav Traders");

        if (success) {
            // Move the original image to the archive
            fs.renameSync(imagePath, archivePath);
            console.log(`📦 Moved original to archive: ${archivePath}`);
            imageCount++;  // Increment only on successful watermark
        } else {
            console.log(`❌ Skipping archive for failed watermark: ${imagePath}`);
        }
    }

    console.log("✅ Watermarking and renaming process completed.");
}

// Run the script
processImages().catch(console.error);
