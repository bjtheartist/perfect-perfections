/**
 * SquareHealthCheck — Visual verification that Square is connected
 *
 * Drop this into any page during development to verify the integration.
 * Shows connection status, environment, and catalog item count.
 */
import React, { useState } from 'react';
import { useSquare } from '../../lib/square/useSquare';

export const SquareHealthCheck: React.FC = () => {
  const { checkHealth, loading, error } = useSquare();
  const [status, setStatus] = useState<{
    connected: boolean;
    environment?: string;
    catalogItems?: number;
  } | null>(null);
  const [checked, setChecked] = useState(false);

  const runCheck = async () => {
    const result = await checkHealth();
    if (result.success && result.data) {
      setStatus(result.data);
    } else {
      setStatus({ connected: false });
    }
    setChecked(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 9999,
        background: '#fff',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        maxWidth: '280px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '8px', color: '#0C1B33' }}>
        Square Integration
      </div>

      {!checked ? (
        <button
          onClick={runCheck}
          disabled={loading}
          style={{
            width: '100%',
            padding: '8px 16px',
            background: '#0C1B33',
            color: '#FAF9F6',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Checking...' : 'Test Connection'}
        </button>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: status?.connected ? '#22c55e' : '#ef4444',
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {status?.connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {status?.connected && (
            <div style={{ color: '#6b7280', lineHeight: 1.5 }}>
              <div>Environment: <strong>{status.environment}</strong></div>
              <div>Catalog Items: <strong>{status.catalogItems}</strong></div>
            </div>
          )}

          {error && (
            <div style={{ color: '#ef4444', marginTop: '8px', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <button
            onClick={() => { setChecked(false); setStatus(null); }}
            style={{
              marginTop: '8px',
              padding: '4px 12px',
              background: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Re-check
          </button>
        </div>
      )}
    </div>
  );
};
