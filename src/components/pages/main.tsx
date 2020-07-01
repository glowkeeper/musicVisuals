import React, { useState } from 'react'

import { useTrail, animated } from 'react-spring'

import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'

//import { guess } from 'web-audio-beat-detector'
import { analyze } from 'web-audio-beat-detector'
import { AudioContext, IAudioBufferSourceNode, IAudioContext} from 'standardized-audio-context'

import { App } from '../../config/strings'

import '../../styles/app.css'

const barForm = 'Bar'
const waveForm = 'Wave'

var audioSource: any

const fast = { tension: 1200, friction: 40 }
const slow = { mass: 10, tension: 200, friction: 50 }
const trans = (x: any, y: any) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`

export const Main = () => {

    const [tempo, setTempo] = useState(0)
    const [freqType, setFreq] = useState(barForm)
    const [trail, set] = useTrail(3, () => ({ xy: [0, 0], config: slow}))

    const animationCanvasColour = 'rgb(224,255,255)'
    const freqCanvasCalour = 'rgb(200,200,200)'

    const audioCtx = new AudioContext()

    let analyser = audioCtx.createAnalyser()
    analyser.minDecibels = -90
    analyser.maxDecibels = -10

    const width = Math.max(960, window.innerWidth),
        freqHeight = Math.min(200, window.innerHeight)
    const animationHeight = 500

    let freqCanvasCtx: any
    let animationCanvasCtx: any
    let drawVisual: any

    const animationDrawInit = (ref: any) => {
        //console.log('this is the canvas DOM element you want', ref)
        if ( ref !== null ) {

            animationCanvasCtx = ref.getContext("2d")
            animationCanvasCtx.fillStyle = animationCanvasColour
            animationCanvasCtx.fillRect(0, 0, width, animationHeight)
            //var path = new Path2D('M 100,100 h 50 v 50 h 50')
            //animationCanvasCtx.stroke(path)
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

      var avg = 0
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
        var centerX = (width / 2) - Math.round(avg)
        var centerY = (animationHeight / 2) - Math.round(avg)
        var radius = 0
        avg = 0

        animationCanvasCtx.beginPath()

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] /2
          //console.log(barHeight)
          freqCanvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ', 50, 50)'
          freqCanvasCtx.fillRect(x, freqHeight-barHeight, barWidth, barHeight)

          x += barWidth + 1

          radius = Math.round(dataArray[i])

          animationCanvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
          animationCanvasCtx.fillStyle = 'rgb(' + radius + ','  + radius + ',' + radius + ')'
          animationCanvasCtx.fill()
          animationCanvasCtx.lineWidth = 3
          animationCanvasCtx.strokeStyle = 'rgb(' + (barHeight+100) + ', 50, 50)'

          avg += dataArray[i]
        }
        avg /= bufferLength
        animationCanvasCtx.stroke();
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
        freqCanvasCtx.lineTo(width, freqHeight/2)
        freqCanvasCtx.stroke()
      }

      doDraw()

    }

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
      getAudioData()
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
        <canvas id="animation" ref={(e) => animationDrawInit(e)} width={width} height={animationHeight}></canvas>
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
