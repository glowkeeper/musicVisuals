import React, { useEffect, useState } from 'react'
//import * as d3 from "d3"

//import { guess } from 'web-audio-beat-detector'
import { analyze } from 'web-audio-beat-detector'
import { AudioContext } from 'standardized-audio-context'

import { App } from '../../config/strings'

import { themeStyles } from '../../styles'

export const Main = () => {

    const [tempo, setTempo] = useState(0)

    const themeClasses = themeStyles()

    const classes = themeStyles()
    const audioCtx = new AudioContext()

    let analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.minDecibels = -90
    analyser.maxDecibels = -10
    //analyser.smoothingTimeConstant = 0.85*/
    const bufferLength = analyser.frequencyBinCount

    let source: any

    var width = Math.max(960, innerWidth),
        height = Math.max(500, innerHeight)

    /*var x1 = width / 2,
        y1 = height / 2,
        x0 = x1,
        y0 = y1,
        i = 0,
        r = 200,
        τ = 2 * Math.PI*/

    let canvasCtx: any
    let drawVisual: any

    const drawInit = (ref: any) => {
        //console.log('this is the canvas DOM element you want', ref)
        if ( ref !== null ) {

            canvasCtx = ref.getContext("2d")
            canvasCtx.fillStyle = 'rgb(200, 200, 200)'
            canvasCtx.fillRect(0, 0, width, height)

        }
    }

    const draw = () => {

      let dataArray = new Uint8Array(bufferLength)

      var doDraw = () => {

        drawVisual = requestAnimationFrame(doDraw)
        analyser.getByteFrequencyData(dataArray)
        console.log(dataArray)

        //var barWidth = (width / bufferLength) * 2.5;
        var barWidth = (width / bufferLength)
        var barHeight
        var x = 0

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i]
          //console.log(barHeight)
          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)'
          canvasCtx.fillRect(x, height-barHeight/200, barWidth, barHeight/200)

          x += barWidth + 1
        }
      }

      doDraw()

    }

    /*const draw = (ref: any) => {
        //console.log('this is the canvas DOM element you want', ref)
        var context = ref.getContext("2d")
        //context!.globalCompositeOperation = "lighter"
        //context.lineWidth = 2

        d3.timer(function() {
          context!.clearRect(0, 0, width, height)

          var z = d3.hsl(++i % 360, 1, .5).rgb(),
              c = "rgba(" + z.r + "," + z.g + "," + z.b + ",",
              x = x0 += (x1 - x0) * .1,
              y = y0 += (y1 - y0) * .1;

          d3.select("#visual").transition()
              .duration(2000)
              .ease(Math.sqrt)
              .tween("circle", function() {
                return function(t: any) {
                  context!.strokeStyle = c + (1 - t) + ")"
                  context!.beginPath()
                  context!.arc(x, y, r * t, 0, τ)
                  context!.stroke()
                }
              })
        })
    }*/

      const getAudioData = (): any => {

          source = audioCtx.createBufferSource();

          var request = new XMLHttpRequest()

          request.open('GET', "./collegeCampus.wav", true)
          request.responseType = 'arraybuffer'

          request.onload = function() {
            var audioData = request.response;
            //console.log(audioData)

            audioCtx.decodeAudioData(audioData, function(buffer: any) {

                source.buffer = buffer as AudioBuffer
                source.connect(audioCtx.destination)
                analyser.connect(audioCtx.destination)
                draw()

                analyze(source.buffer)
                  .then((bpm: any) => {
                      console.log("BPM: ", bpm)
                      //setTempo(bpm)
                  })
                  .catch((err: any) => {
                      console.log(err)
                  })
              },
              function(e: any){ console.log("Error with decoding audio data" + e.err); })

          }

          request.send()
      }

    const play = () => {
      getAudioData();
      source.start(0)
    }

    const stop = () => {
      source.stop(0)
    }

    //<p> Tempo is {tempo}</p>

    return (
      <>
        <canvas ref={(e) => drawInit(e)} width={width} height={height}></canvas>
        <button onClick={() => play()}>play!</button>
        <button onClick={() => stop()}>stop!</button>

      </>
    )
}
