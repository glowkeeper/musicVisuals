import React, { useEffect, useState } from 'react'
import * as d3 from "d3"

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

    const [tempo, setTempo] = useState(0)

    useEffect(() => {
        console.log('Hello from useEffect!');
      }, [tempo]); // <-- See the change here


    const themeClasses = themeStyles()

    const classes = themeStyles()
    const audioCtx = new AudioContext()

    let source: any
    let audioTempo = 0

    var width = Math.max(960, innerWidth),
        height = Math.max(500, innerHeight);

    var x1 = width / 2,
        y1 = height / 2,
        x0 = x1,
        y0 = y1,
        i = 0,
        r = 200,
        τ = 2 * Math.PI;

    const drawCanvas = (ref: any) => {
        console.log('this is the canvas DOM element you want', ref)
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
      }

      const getAudioData = (): any => {

          let source = audioCtx.createBufferSource();
          var request = new XMLHttpRequest();

          request.open('GET', "./collegeCampus.wav", true)
          request.responseType = 'arraybuffer'

          request.onload = function() {
            var audioData = request.response;

            audioCtx.decodeAudioData(audioData, function(buffer: any) {
                source.buffer = buffer as AudioBuffer
                source.connect(audioCtx.destination)
                guess(source.buffer)
                  .then(({ bpm, offset }: any) => {
                      console.log("track info: ", bpm, offset)
                      setTempo(bpm)
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

    const play = () => {
      source = getAudioData();
      source.start(0);
    }

    const stop = () => {
      source.stop(0)
    }

    return (
      <>
        <canvas ref={(e) => drawCanvas(e)} width={width} height={height}></canvas>
        <button onClick={() => play()}>play!</button>
        <button onClick={() => stop()}>stop!</button>
        <p> Tempo is {tempo}</p>

      </>
    )
}
