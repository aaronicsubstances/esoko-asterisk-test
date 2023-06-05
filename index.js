import dotenv from 'dotenv';
import ariClient from 'ari-client';

dotenv.config();

async function main() {
    console.log(`connecting to ARI server at ${process.env.ARI_URL} ...`)
    const ariConnection = await ariClient.connect(process.env.ARI_URL,
        process.env.ARI_USER, process.env.ARI_PASSWORD)

    // start app to receive events about outgoing call
    console.log('connected to ARI server successfully')
    ariConnection.start(process.env.ARI_CALL_APP)

    // finally create and start outgoing call
    const outgoing = ariConnection.Channel();
    outgoing.once('StasisStart', function(event, outgoing) {
        console.log('StasisStart')

        outgoing.answer(function(err) {
            if (err) {
                console.error('answer returned error', err)
            }
            else {
                console.log('answer was successful')
            }
        })
    })
    outgoing.once('StasisEnd', function(event, channel) {
        console.log('StasisEnd')
    })
    outgoing.once('ChannelDestroyed', function(event, channel) {
        console.log('ChannelDestroyed')
        process.exit()
    })

    // finally start the call and keep process alive until
    // call 
    outgoing.originate({
        endpoint: process.env.ARI_CALL_ENDPOINT,
        app: process.env.ARI_CALL_APP,
        appArgs: process.env.ARI_CALl_APP_ARGS
    }).catch(err => {
        console.log('originate returned error', err);
        process.exit();
    });
}

main()