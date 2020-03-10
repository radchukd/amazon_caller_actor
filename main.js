
const Apify = require('apify');
const ApifyClient = require('apify-client');
const httpRequest = require('@apify/http-request');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { memory, useClient, fields, maxItems } = input;
    const token = process.env.APIFY_TOKEN;
    const userId = process.env.APIFY_USER_ID;
    const taskId = process.env.APIFY_ACTOR_TASK_ID;

    return Promise.resolve()
        .then(() => {
            if (useClient) {
                const apifyClient = new ApifyClient({
                    userId,
                    token,
                });
                return apifyClient.tasks.runTask({
                    taskId,
                    token,
                    memory,
                    timeout: 0,
                    waitForFinish: 120,
                });
            }
            const runTaskUrl = `https://api.apify.com/v2/actor-tasks/${taskId}/run-sync?token=${token}&ui=1`;
            return httpRequest({
                url: runTaskUrl,
                method: 'POST',
                timeoutSecs: 720,
                body: { memory },
            });
        })
        .then(async () => {
            const lastRunUrl = `https://api.apify.com/v2/actor-tasks/${taskId}/runs/last/dataset/`
                                + `items?token=${token}&format=csv&limit=${maxItems}&fields=${fields}`;
            const { body } = await httpRequest({ url: lastRunUrl });
            await Apify.setValue('OUTPUT', { output: body });
        });
});
