
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images/prophets');

async function optimizeImages() {
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('Directory not found:', IMAGES_DIR);
        return;
    }

    const files = fs.readdirSync(IMAGES_DIR).filter(file => file.endsWith('.png'));
    let savedSize = 0;

    console.log(`Found ${files.length} images to optimize...`);

    for (const file of files) {
        const inputPath = path.join(IMAGES_DIR, file);
        const outputPath = path.join(IMAGES_DIR, file.replace('.png', '.webp'));

        try {
            const statsBefore = fs.statSync(inputPath);

            await sharp(inputPath)
                .webp({ quality: 75 }) // Good balance for mobile
                .toFile(outputPath);

            const statsAfter = fs.statSync(outputPath);
            const saved = statsBefore.size - statsAfter.size;
            savedSize += saved;

            console.log(`✅ ${file}: ${(statsBefore.size / 1024).toFixed(2)}KB -> ${(statsAfter.size / 1024).toFixed(2)}KB (Saved: ${(saved / 1024).toFixed(2)}KB)`);

            // Delete original file to save space
            fs.unlinkSync(inputPath);
        } catch (error) {
            console.error(`❌ Failed to optimize ${file}:`, error);
        }
    }

    console.log(`\n🎉 Total space saved: ${(savedSize / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
