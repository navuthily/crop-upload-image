import React, { useState, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import { useDebounceEffect } from './useDeBounceEffect'
import { imgPreview } from './ImagePreview'
import 'react-image-crop/dist/ReactCrop.css'
import './App.css'
// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 0,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}
export default function App() {
  const [imgSrc, setImgSrc] = useState('')
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState()
  const [srcImgToUpload, setSrcImgToUpload] = useState()
  const [imageNoCrop, setImageNoCrop] = useState()
  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      console.log(e.target.files[0])
      setImageNoCrop(e.target.files[0])
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () =>
        setImgSrc(reader.result.toString() || ''),
      )
      reader.readAsDataURL(e.target.files[0])
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        const a = await imgPreview(imgRef.current, completedCrop)
        setSrcImgToUpload(a)
      }
    },
    100,
    [completedCrop, scale, rotate],
  )

  function onSave() {


    if (srcImgToUpload && crop.width > 0 && crop.height > 0) {
      fetch(srcImgToUpload)
        .then((response) => response.blob())
        .then((myBlob) => {
          const wavefilefromblob = new File([myBlob], 'filename.png',{type:myBlob.type});
          console.log(wavefilefromblob,'na ku te')
        })
    } else {
    }
  }
  return (
    <div className="App">
      <div className="Crop-Controls">
        <input type="file" accept="image/*" onChange={onSelectFile} />
        <div>
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="number"
            step="0.1"
            value={scale}
            disabled={!imgSrc}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="number"
            value={rotate}
            disabled={!imgSrc}
            onChange={(e) =>
              setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
            }
          />
        </div>
      </div>
      <div>
        <button onClick={onSave}>Lưu</button>
      </div>
      <div className="wrapper-img">
        {' '}
        {Boolean(imgSrc) && (
          <div className="wrapper-crop">
            {' '}
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                className="img-crop"
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
        )}
        <div>
          {crop?.width > 0 && crop?.height > 0 && (
            <div>
              <img
                alt=""
                src={srcImgToUpload}
                width={completedCrop?.width}
                style={{ objectFit: 'cover' }}
                height={completedCrop?.height}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
