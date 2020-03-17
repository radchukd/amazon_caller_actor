
const Apify = require('apify');
const ApifyClient = require('apify-client');
const retry = require('async-retry');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { memory, fields, maxItems } = input;
    const token = process.env.APIFY_TOKEN;
    const userId = process.env.APIFY_USER_ID;
    const taskId = process.env.APIFY_ACTOR_TASK_ID;

    const apifyClient = new ApifyClient({
        userId,
        token,
    });
    const { id, actId } = await apifyClient.tasks.runTask({
        taskId,
        token,
        memory,
        timeout: 0,
    });

    const datasetId = await retry(async () => {
        const res = await apifyClient.acts.getRun({
            runId: id,
            actId,
        });

        if (!res.finishedAt) {
            throw new Error('not finished');
        }
        return res.defaultDatasetId;
    }, { retries: 15, minTimeout: 20000 });

    const { items } = await apifyClient.datasets.getItems({
        format: 'csv',
        limit: maxItems,
        datasetId,
        fields,
    });

    await Apify.setValue('OUTPUT', { output: items });
});
