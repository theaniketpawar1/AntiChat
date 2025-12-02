require('dotenv').config();
const axios = require('axios');

const models = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'liquid/lfm-40b:free',
    'openai/gpt-4o',
    'openai/gpt-4-turbo',
    'openai/gpt-4o-mini'
];

const nvidiaModel = 'minimaxai/minimax-m2';

async function testModel(modelName, isNvidia = false) {
    try {
        console.log(`\nTesting ${modelName}...`);

        let response;

        if (isNvidia) {
            response = await axios.post(
                'https://integrate.api.nvidia.com/v1/chat/completions',
                {
                    model: modelName,
                    messages: [{ role: 'user', content: 'Say "Hello, I am working!" in a single sentence.' }],
                    temperature: 1,
                    top_p: 0.7,
                    max_tokens: 100
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } else {
            response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: modelName,
                    messages: [{ role: 'user', content: 'Say "Hello, I am working!" in a single sentence.' }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const content = response.data.choices[0].message.content;

        if (content && content.trim().length > 0) {
            console.log(`✅ ${modelName} - WORKING`);
            console.log(`   Response: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
        } else {
            console.log(`⚠️  ${modelName} - EMPTY RESPONSE`);
        }
    } catch (error) {
        console.log(`❌ ${modelName} - FAILED`);
        if (error.response) {
            console.log(`   Error: ${error.response.data?.error?.message || error.response.statusText}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('TESTING ALL ANTICHAT MODELS');
    console.log('='.repeat(60));

    console.log('\n📋 OpenRouter Models:');
    for (const model of models) {
        await testModel(model, false);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }

    console.log('\n📋 NVIDIA Models:');
    await testModel(nvidiaModel, true);

    console.log('\n' + '='.repeat(60));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(60));
}

runTests();
