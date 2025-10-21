// components/VideoBackground.tsx
export default function VideoBackground() {
  return (
    <div className="video-background">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="video-element "
      >
        <source src="/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay" />
    </div>
  )
}