import { ImageResponse } from 'next/og'

export const alt = 'Daiana Szwimer, Senior Product Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 80,
          background: '#0a0a0a', color: '#fafafa',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.6 }}>daiana.dev</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 80, fontWeight: 700 }}>Daiana Szwimer</div>
          <div style={{ fontSize: 36, opacity: 0.8 }}>
            Senior Product Engineer · Buenos Aires
          </div>
        </div>
      </div>
      ),
      { ...size }
    )
}