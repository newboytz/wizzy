/**
 * PLUGIN: UTANI NDOGO PRO MAX - 30 RANDOM JOKES
 * Optimized for CHUBWA-MD
 */

module.exports = async (sock, msg, config) => {                                 const prefix = config.prefix || '.';
    const body = msg.body.toLowerCase();                                    
    if (body.startsWith(prefix + 'utani')) {
        const senderNumber = msg.sender.split('@')[0];                      
        // LIST YA MADONGO 30 YA KICHUBA
        const listUtani = [                                                             `Oya namba ${senderNumber}, hivi hiyo ni namba ya simu au ni namba ya siri ya vocha iliyokataliwa na mtandao? 😂`,
            `Namba ${senderNumber} anaandika kwa mbwembwe kumbe hata bundle la kujiunga hana, anatumia Wi-Fi ya jirani! 💀`,                                        `Huyu mwenye namba ${senderNumber} sura yake na namba yake haviendani kabisa, namba imenyooka sura sasa kama dongo la chooni... 🙊`,
            `Oya ${senderNumber}, namba yako inaishia na ${senderNumber.slice(-2)}, hiyo ndio idadi ya sahani za ugali unazopiga kwa siku moja? 🍚`,
            `Nimecheki namba ${senderNumber} kwenye system nikajua ni hela kumbe ni bishoo mmoja hivi anatafuta kiki hapa. 🔥`,                                     `Namba ${senderNumber} mbona unachati kama unaandika barua ya madai? Tulia basi kijana! 🤣`,
            `Huyu ${senderNumber} anaonekana ni mtu wa maana, kumbe ukimpigia anakuambia 'Samahani, salio lako halitoshi...' 💸`,
            `Oya ${senderNumber}, hivi hiyo namba yako ni ya nchi gani? Mbona inaonekana kama namba za kufungulia gereji? 🛠️`,
            `Namba ${senderNumber} anaandika kwa herufi kubwa, anadhani ndio atapata views nyingi... pole sana! 📉`,
            `Huyu ${senderNumber} nishamsoma kitambo, anakuja hapa botini kujifanya ana kodi kumbe anadanga! 💀`,
            `Namba ${senderNumber} nakushauri ubadilishe simu, mbona herufi zako zinaonekana zina vumbi? 🧹`,                                                       `Namba ${senderNumber} ana haraka ya kuchati kuliko haraka ya kutafuta maisha, kaza kijana! 🏃`,
            `Eti ${senderNumber} naye anajifanya bishoo, wakati hata profile picture yake ameiba Pinterest! 🖼️`,
            `Hivi namba ${senderNumber} mbona unachati kama mtu anayekimbizwa na nyuki? Shusha presha! 🐝`,                                                         `Namba ${senderNumber} ndio wale wale wakiwekwa kundi la WhatsApp kazi yao ni 'Seen' tu kama sanamu la Posta! 🗿`,                                      `Namba ${senderNumber} ukimuona kwenye group utadhani msemaji wa serikali, kumbe nyumbani hata neno moja hapati! 🤐`,
            `Huyu mwenye namba ${senderNumber} anaonekana anapenda sifa, lakini mfukoni ana 'shilingi sifuri' tu! �`,
            `Namba ${senderNumber} hivi bado unatumia ile simu uliyoandikiwa urithi na babu yako? Mbona inatoa moshi? 💨`,                                          `Oya ${senderNumber}, namba yako inaonekana kama namba za kupigia simu za dharura za zimamoto, ipo serious sana! 🚒`,
            `Namba ${senderNumber} anachati usiku kucha anatafuta mchumba, wakati hata mswaki wa asubuhi hana! �`,                                                  `Hivi namba ${senderNumber} uliwahi kuwaza kuifuta hii namba yako ukaanza maisha upya? Mbona ina gundu! 🕳️`,
            `Namba ${senderNumber} akipiga picha anajificha uso, anadhani sisi ni wajinga hatujui ana sura ya kipekee! 👺`,
            `Oya ${senderNumber}, hivi wewe ni binadamu au ni robot ya kichina? Mbona hujibu utani kwa hisia? 🤖`,                                                  `Namba ${senderNumber} mbona unaonekana kama mtu anayelazimishwa kutumia WhatsApp na mama yake? 🤱`,
            `Namba ${senderNumber} ndio wale wakiingia kundi wanachati dakika mbili, kisha wanajitoa 'Left' kwa sifa! 🚪`,
            `Huyu ${senderNumber} anaonekana ni fundi wa maneno, lakini ukimpa jembe akalime anaanza kulia njaa! 🌾`,
            `Namba ${senderNumber} mbona unajibu meseji kama umekula ndimu? Changamka basi bishoo! 🍋`,
            `Namba ${senderNumber} hivi namba yako mbona inafanana na namba za ufundi gereji kule Kirumba? 🔧`,
            `Huyu mwenye namba ${senderNumber} anaonekana ni mzee wa mizinga, 'Nitumie jero nile' ndio salamu yake! 🦟`,
            `Namba ${senderNumber} nakupa tano kwa kuvumilia hii namba yako kwa miaka yote hii bila aibu! ✋`
        ];

        // MAUJANJA: Randomize 100%
        const randomUtani = listUtani[Math.floor(Math.random() * listUtani.length)];

        try {
            return await sock.sendMessage(msg.chat, {
                text: `🚀 *CHUBWA-MD UTANI SERVICE V4*\n\n${randomUtani}`
            }, { quoted: msg });
        } catch (err) {
            console.log("Error:", err);
        }
    }
};
