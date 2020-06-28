import React from 'react'

import { guess } from 'web-audio-beat-detector'
//import { analyze } from 'web-audio-beat-detector'
import { AudioContext } from 'standardized-audio-context'

import { App } from '../../config/strings'

import { themeStyles } from '../../styles'

function getData(audioCtx: any): any {

    let source = audioCtx.createBufferSource();
    var request = new XMLHttpRequest();

    request.open('GET', "./collegeCampus.wav", true)
    request.responseType = 'arraybuffer'

    request.onload = function() {
      var audioData = request.response;

      audioCtx.decodeAudioData(audioData, function(buffer: any) {
          source.buffer = buffer
          source.connect(audioCtx.destination)
          guess(source.buffer)
            .then(({ bpm, offset }: any) => {
                console.log("track info: ", bpm, offset)
            })
            .catch((err: any) => {
                console.log(err)
            });
          //source.loop = true
        },
        function(e: any){ console.log("Error with decoding audio data" + e.err); })

    }
    
    request.send()
    return source
}


export const Main = () => {

    const classes = themeStyles()
    const audioCtx = new AudioContext()

    let source: any
    let audioTempo = 0

    const play = () => {
      source = getData(audioCtx);
      source.start(0);
    }

    const stop = () => {
      source.stop(0)
    }

    return (
      <>
        <button onClick={() => play()}>play!</button>
        <button onClick={() => stop()}>stop!</button>

        <p> Tempo is {audioTempo}</p>

      </>
    )
}
