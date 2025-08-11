const fs = require('fs');
const path = require('path');

// Path to the source file containing the ad domains
const adDomainsFilePath = path.join(__dirname, '../src/bg_scripts/adblock_scripts/ad_domains.js');

// Path to the output file for the generated rules
const rulesFilePath = path.join(__dirname, '../public/rules/ad_blocking.json');

// Read the ad domains file
fs.readFile(adDomainsFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading ad_domains.js:', err);
        return;
    }

    // Extract the adDomains array from the file content
    const match = data.match(/var adDomains = (\[[\s\S]*?\])/);
    if (!match || !match[1]) {
        console.error('Could not find adDomains array in ad_domains.js');
        return;
    }

    // Parse the array string into a JavaScript array
    // Note: Using eval() here is safe because we control the input file.
    // A more robust solution for untrusted input would be a proper parser.
    const adDomains = eval(match[1]);

    // Transform the domains into declarativeNetRequest rules
    const rules = adDomains.map((domain, index) => {
        // Extract the domain from the filter string
        const urlFilter = domain.replace(/\*:\/\/\*?\.?/, '||');
        return {
            id: index + 1, // Unique ID for each rule
            priority: 1,
            action: { type: 'block' },
            condition: {
                urlFilter: urlFilter.replace(/\/\*$/, ''), // Remove trailing /*
                resourceTypes: [
                    'main_frame',
                    'sub_frame',
                    'stylesheet',
                    'script',
                    'image',
                    'font',
                    'object',
                    'xmlhttprequest',
                    'ping',
                    'csp_report',
                    'media',
                    'websocket',
                    'other',
                ],
            },
        };
    });

    // Write the generated rules to the output file
    fs.writeFile(rulesFilePath, JSON.stringify(rules, null, 2), (err) => {
        if (err) {
            console.error('Error writing ad_blocking.json:', err);
            return;
        }
        console.log('Successfully generated ad_blocking.json with', rules.length, 'rules.');
    });
});
