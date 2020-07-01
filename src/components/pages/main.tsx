import React, { useState } from 'react'

//import { guess } from 'web-audio-beat-detector'
import { analyze } from 'web-audio-beat-detector'
import { AudioContext } from 'standardized-audio-context'

import { App } from '../../config/strings'

import '../../styles/app.css'

const barForm = 'Bar'
const waveForm = 'Wave'

var audioSource: any

export const Main = () => {

    const [tempo, setTempo] = useState(0)
    const [freqType, setFreq] = useState(barForm)

    const animationCanvasColour = 'rgb(131,12,12)'
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

        if ( ref !== null ) {

            animationCanvasCtx = ref.getContext("2d")
            animationCanvasCtx.fillStyle = animationCanvasColour
            animationCanvasCtx.fillRect(0, 0, width, animationHeight)
        }
    }

    const freqDrawInit = (ref: any) => {

        if ( ref !== null ) {

            freqCanvasCtx = ref.getContext("2d")
            freqCanvasCtx.fillStyle = freqCanvasCalour
            freqCanvasCtx.fillRect(0, 0, width, freqHeight)
        }
    }

    const doAnimation = (dataArray: any, avg: number) => {

        const bufferLength = analyser.frequencyBinCount
        var centerX = (width / 2) - Math.round(avg)
        var centerY = animationHeight / 2
        var radius = 0

        animationCanvasCtx.beginPath()

        for(var i = 0; i < bufferLength; i++) {

          if (dataArray[i] > 0) {

              radius =  Math.floor(Math.random() * dataArray[i])

              animationCanvasCtx.ellipse(centerX, centerY, radius * 2, radius * 8, Math.PI / 2, 0, 2 * Math.PI)
              animationCanvasCtx.fillStyle = 'rgb(' + radius + ','  + radius + ',' + radius + ')'
              animationCanvasCtx.fill()
              animationCanvasCtx.lineWidth = 3
              animationCanvasCtx.strokeStyle = 'rgb(' + radius + ', 50, 50)'
          }
        }

        animationCanvasCtx.stroke()
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
        var avg = 0

        for(var i = 0; i < bufferLength; i++) {

          barHeight = dataArray[i] / 2
          freqCanvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ', 50, 50)'
          freqCanvasCtx.fillRect(x, freqHeight-barHeight, barWidth, barHeight)

          x += barWidth + 1
          avg += dataArray[i]
        }

        avg /= bufferLength
        doAnimation(dataArray, avg)
      }

      doDraw()

    }

    // Not called, presently, as this doesn't perfrom well alongside the animation
    const drawLine = () => {

      var avg = 0
      analyser.fftSize = 2048
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

        var sliceWidth = width * 1.0 / bufferLength
        var x = 0
        avg = 0

        for(var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0
            var y = v * freqHeight / 2

            if(i === 0) {
              freqCanvasCtx.moveTo(x, y)
            } else {
              freqCanvasCtx.lineTo(x, y)
            }

            x += sliceWidth
            avg += dataArray[i]
        }

        freqCanvasCtx.lineTo(width, freqHeight/2)
        freqCanvasCtx.stroke()

        avg /= bufferLength
        doAnimation(dataArray, avg)
      }

      doDraw()

    }

      const getAudioData = (): any => {

          audioSource = audioCtx.createBufferSource()
          var request = new XMLHttpRequest()

          request.open('GET', "./collegeCampus.wav", true)
          request.responseType = 'arraybuffer'

          request.onload = function() {
            var audioData = request.response

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
              function(e: any){ console.log("Error with decoding audio data" + e.err) })

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
        <br/>
        <button onClick={() => play()}>Play</button>
        <button onClick={() => stop()}>Stop</button>
        <p>Tempo is {tempo}</p>

      </>
    )
}
