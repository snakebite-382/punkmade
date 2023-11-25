const cron = require('node-cron');
const {dbDriver} = require('./api/db.js')
const {checkAndRemoveReportedMedia} = require('./api/Feed/Feed.service.js')

async function cleanReports() {
    const {records: allReports} = await dbDriver.executeQuery(
        `MATCH (scene:SCENE)-[:HAS_CATEGORY | POSTED_ON | HAS_DOCUMENT | COMMENTED_ON | REPLIED_TO *]-(media:POST | COMMENT | DOCUMENT)-[:REPORTED | VOTED_TO_REMOVE]-(:USER)
        RETURN scene.name as scene, ID(media) as mediaID
        `,
        {},
        {database: 'neo4j'}
    )

    for(const report of allReports) {
        checkAndRemoveReportedMedia(report.get('mediaID'), report.get('scene'))
    }
}

function initJobs () {
    cron.schedule('15 * * * *', () => {
        cleanReports()
    });
} 


module.exports = {
    initJobs
}
