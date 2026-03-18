const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    const bytenode = require('bytenode');
    const folders = ['./plugins', './lib'];

    console.log('🛡️  SASAMPA-MD: Securing system modules...');

    folders.forEach(folder => {
        const fullPath = path.resolve(folder);
        if (!fs.existsSync(fullPath)) return;

        fs.readdirSync(fullPath).forEach(file => {
            // Funga kila .js isipokuwa settings ambazo user anazihitaji
            if (file.endsWith('.js') && file !== 'settings.js') {
                const filePath = path.join(fullPath, file);
                
                // Tengeneza Bytecode
                bytenode.compileFile({
                    filename: filePath,
                    output: filePath.replace('.js', '.jsc')
                });
                
                // Futa orijinale
                fs.unlinkSync(filePath);
            }
        });
    });

    console.log('✅ Encryption Complete. System is now private.');
    
    // Futa hili faili lenyewe ili lisijulikane
    fs.unlinkSync(__filename);

} catch (err) {
    // Endelea kimya kimya kama kuna tatizo
          }
                                             
