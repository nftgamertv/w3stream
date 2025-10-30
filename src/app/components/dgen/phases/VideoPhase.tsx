"use client"

export function VideoPhase({ roomId, playerId, round, sessionId }: any) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Generating Videos...</h2>
        <p className="mt-2 text-white/60">AI is creating lipsync videos</p>
      </div>
    </div>
  )
}
