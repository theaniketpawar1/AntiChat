const axios = require('axios');

const models = [
    { name: 'Llama 3.2 3B (Free)', id: 'meta-llama/llama-3.2-3b-instruct:free' },
    { name: 'Mistral 7B (Free)', id: 'mistralai/mistral-7b-instruct:free' },
    { name: 'Liquid LFM 40B (Free)', id: 'liquid/lfm-40b:free' },
    { name: 'GPT-4o (Paid)', id: 'openai/gpt-4o' },
    { name: 'GPT-4 Turbo (Paid)', id: 'openai/gpt-4-turbo' },
    { name: 'GPT-4o Mini (Paid)', id: 'openai/gpt-4o-mini' }
];

async function testModels() {
    console.log('Starting Model Tests...\n');

    for (const model of models) {
        process.stdout.write(`Testing ${model.name}... `);
        try {
            const start = Date.now();
            const response = await axios.post('http://localhost:3000/api/chat', {
                message: 'Hello, say hi!',
                model: model.id
            });
            const duration = Date.now() - start;

            if (response.data.error) {
                console.log(`❌ FAILED (${duration}ms)`);
                console.log(`   Error: ${response.data.error}`);
            } else {
                console.log(`✅ PASSED (${duration}ms)`);
            }
        } catch (error) {
            console.log(`❌ FAILED`);
            console.log(`   Error: ${error.message}`);
            if (error.response && error.response.data) {
                console.log(`   Details: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
    console.log('\nTest Complete.');
}

testModels();
