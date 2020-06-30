import React, { useEffect, useState } from 'react'

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
//import * as d3 from "d3"

//import { guess } from 'web-audio-beat-detector'
import { analyze } from 'web-audio-beat-detector'
import { AudioContext, IAudioBufferSourceNode, IAudioContext} from 'standardized-audio-context'

import { App } from '../../config/strings'

import { themeStyles } from '../../styles'

const barForm = 'Bar'
const waveForm = 'Wave'

var audioSource: any

export const Main = () => {

    const [tempo, setTempo] = useState(0)
    const [freqType, setFreq] = useState(barForm)

    const themeClasses = themeStyles()

    const d3CanvasCalour = 'rgb(224,255,255)'
    const freqCanvasCalour = 'rgb(200,200,200)'

    const classes = themeStyles()
    const audioCtx = new AudioContext()

    let analyser = audioCtx.createAnalyser()
    analyser.minDecibels = -90
    analyser.maxDecibels = -10

    const width = Math.max(960, window.innerWidth),
        freqHeight = Math.min(200, window.innerHeight)
        d3Height = freqHeight

    /*var x1 = width / 2,
        y1 = height / 2,
        x0 = x1,
        y0 = y1,
        i = 0,
        r = 200,
        τ = 2 * Math.PI*/

    let freqCanvasCtx: any
    let d3CanvasCtx: any
    let drawVisual: any

    const d3DrawInit = (ref: any) => {
        //console.log('this is the canvas DOM element you want', ref)
        if ( ref !== null ) {

            d3CanvasCtx = ref.getContext("2d")
            d3CanvasCtx.fillStyle = d3CanvasCalour
            d3CanvasCtx.fillRect(0, 0, width, freqHeight)
        }
    }

    const freqDrawInit = (ref: any) => {
        //console.log('this is the canvas DOM element you want', ref)
        if ( ref !== null ) {

            freqCanvasCtx = ref.getContext("2d")
            freqCanvasCtx.fillStyle = freqCanvasCalour
            freqCanvasCtx.fillRect(0, 0, width, freqHeight)
        }
    }

    const drawBar = () => {

      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      let dataArray = new Uint8Array(bufferLength)

      var doDraw = () => {

        drawVisual = requestAnimationFrame(doDraw)
        analyser.getByteFrequencyData(dataArray)
        freqCanvasCtx.fillStyle = freqCanvasCalour
        freqCanvasCtx.fillRect(0, 0, width, freqHeight)

        var barWidth = (width / bufferLength) * 2.5
        var barHeight
        var x = 0

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] /2
          //console.log(barHeight)
          freqCanvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ', 50, 50)'
          freqCanvasCtx.fillRect(x, freqHeight-barHeight, barWidth, barHeight)

          x += barWidth + 1
        }
      }

      doDraw()

    }

    const drawLine = () => {

      var avg = 0
      analyser.fftSize = 1024
      const bufferLength = analyser.frequencyBinCount
      let dataArray = new Uint8Array(bufferLength)

      var doDraw = () => {

        drawVisual = requestAnimationFrame(doDraw)
        analyser.getByteTimeDomainData(dataArray)
        freqCanvasCtx.fillStyle = freqCanvasCalour
        freqCanvasCtx.fillRect(0, 0, width, freqHeight)

        freqCanvasCtx.lineWidth = 2
        freqCanvasCtx.strokeStyle = 'rgb(' + (avg+100) + ',50,50)'
        freqCanvasCtx.beginPath()

        var sliceWidth = width * 1.0 / bufferLength;
        var x = 0
        avg = 0

        for(var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0
            var y = v * freqHeight/2

            if(i === 0) {
              freqCanvasCtx.moveTo(x, y)
            } else {
              freqCanvasCtx.lineTo(x, y)
            }

            x += sliceWidth;
            avg += dataArray[i]
        }
        avg /= bufferLength
        freqCanvasCtx.lineTo(width, freqHeight/2);
        freqCanvasCtx.stroke();
      }

      doDraw()

    }
256

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

          audioSource = audioCtx.createBufferSource()
          var request = new XMLHttpRequest()

          request.open('GET', "./collegeCampus.wav", true)
          request.responseType = 'arraybuffer'

          request.onload = function() {
            var audioData = request.response;
            //console.log(audioData)

            audioCtx.decodeAudioData(audioData, function(buffer: any) {

                audioSource.buffer = buffer as AudioBuffer
                audioSource.connect(analyser)
                analyser.connect(audioCtx.destination)

                if ( freqType === barForm) {
                    drawBar()
                } else {
                    drawLine()
                }

                analyze(audioSource.buffer)
                  .then((bpm: any) => {
                      //console.log("BPM: ", bpm)
                      setTempo(Math.round(bpm * 100) / 100)
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
      audioSource.start(0)
    }

    const stop = () => {
      audioSource.stop(0)
    }

    const barOrWave = (event: any) => {
        setFreq(event.target.value)
    }

    return (
      <>
        <canvas ref={(e) => d3DrawInit(e)} width={width} height={d3Height}></canvas>
        <canvas ref={(e) => freqDrawInit(e)} width={width} height={freqHeight}></canvas>
        <FormControl component="fieldset">
          <RadioGroup name="waveform" value={freqType} onChange={barOrWave}  row>
            <FormControlLabel value={barForm} control={<Radio />} label={barForm}/>
            <FormControlLabel value={waveForm} control={<Radio />} label={waveForm} />
          </RadioGroup>
        </FormControl>
        <br/>
        <button onClick={() => play()}>Play</button>
        <button onClick={() => stop()}>Stop</button>
        <p>Tempo is {tempo}</p>

      </>
    )
}
