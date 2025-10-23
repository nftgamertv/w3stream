import React from 'react';

export default function LiquidOrbs() {
  return (
    <div style={{
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'black',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <style>{`
        @keyframes spin-1 {
          0% { transform: rotate(90deg); }
          100% { transform: rotate(450deg); }
        }

        @keyframes spin-2 {
          0% { transform: rotate(-50deg); }
          100% { transform: rotate(310deg); }
        }

        @keyframes spin-3 {
          0% { transform: rotate(220deg); }
          100% { transform: rotate(580deg); }
        }

        @keyframes spin-4 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-5 {
          0% { transform: rotate(-100deg); }
          100% { transform: rotate(260deg); }
        }

        @keyframes spin-6 {
          0% { transform: rotate(210deg); }
          100% { transform: rotate(570deg); }
        }

        .orb-1 { animation: spin-1 5s ease-in infinite forwards; }
        .orb-2 { animation: spin-2 3s ease-in 1.5s infinite forwards; }
        .orbit-1 { animation: spin-3 8s ease-in-out infinite forwards; }
        .orbit-2 { animation: spin-4 6s ease-in-out infinite; }
        .orbit-3 { animation: spin-5 3.5s ease-in-out infinite forwards; }
        .orbit-4 { animation: spin-2 4.5s ease-in-out infinite forwards; }
        .orbit-5 { animation: spin-6 3.5s ease-in-out infinite forwards; }
      `}</style>

      <main style={{
        position: 'relative',
        background: '#000',
        height: '450px',
        width: '450px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'blur(8px) contrast(18) hue-rotate(20deg)',
     mixBlendMode: 'screen'
      }}>
        {/* Center orb with rotating satellites */}
        <div style={{
          position: 'relative',
          width: '80px',
          aspectRatio: '1',
           borderRadius: '50%'
        }}>
          <div className="orb-1" style={{
            position: 'absolute',
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            left: '-5px',
            width: '70px'
          }}>
            <span style={{
              position: 'absolute',
              aspectRatio: '1',
              background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
              borderRadius: '50%',
              width: '50px'
            }}></span>
          </div>
          <div className="orb-2" style={{
            position: 'absolute',
            aspectRatio: '1',
            borderRadius: '50%',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            left: '10px',
            bottom: '0',
            width: '80px'
          }}>
            <span style={{
              position: 'absolute',
              aspectRatio: '1',
              background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
              borderRadius: '50%',
              width: '60px'
            }}></span>
          </div>
        </div>

        {/* Orbit 1 */}
        <span className="orbit-1" style={{
          position: 'absolute',
          left: '50%',
          width: '150px',
          height: '150px'
        }}>
          <span style={{
            position: 'absolute',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            right: '20px',
            top: '20px',
            aspectRatio: '1',
            borderRadius: '50%',
            width: '30px'
          }}></span>
        </span>

        {/* Orbit 2 */}
        <span className="orbit-2" style={{
          position: 'absolute',
          left: '20%',
          width: '150px',
          height: '100px'
        }}>
          <span style={{
            position: 'absolute',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            right: '20px',
            top: '20px',
            aspectRatio: '1',
            borderRadius: '50%',
            width: '21px'
          }}></span>
        </span>

        {/* Orbit 3 */}
        <span className="orbit-3" style={{
          position: 'absolute',
          left: '48%',
          top: '48%',
          width: '100px',
          height: '100px'
        }}>
          <span style={{
            position: 'absolute',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            right: '20px',
            top: '20px',
            aspectRatio: '1',
            borderRadius: '50%',
            width: '25px'
          }}></span>
        </span>

        {/* Orbit 4 */}
        <span className="orbit-4" style={{
          position: 'absolute',
          left: '28%',
          top: '48%',
          width: '200px',
          height: '200px'
        }}>
          <span style={{
            position: 'absolute',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            right: '20px',
            top: '20px',
            aspectRatio: '1',
            borderRadius: '50%',
            width: '20px'
          }}></span>
        </span>

        {/* Orbit 5 */}
        <span className="orbit-5" style={{
          position: 'absolute',
          left: '50%',
          top: '25%',
          width: '200px',
          height: '200px'
        }}>
          <span style={{
            position: 'absolute',
            background: 'linear-gradient(149deg,rgba(97, 92, 242, 1) 0%, rgba(85, 104, 217, 1) 13%, rgba(83, 105, 210, 1) 26%, rgba(75, 113, 191, 1) 47%, rgba(3, 127, 140, 1) 65%, rgba(33, 191, 162, 1) 100%)',
            right: '20px',
            top: '20px',
            aspectRatio: '1',
            borderRadius: '50%',
            width: '20px'
          }}></span>
        </span>
      </main>
    </div>
  );
}
