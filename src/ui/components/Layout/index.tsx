import React, { CSSProperties } from 'react';

import { useExtensionIsInTab } from '@/ui/features/browser/tabs';

import './index.less';

export interface LayoutProps {
  children?: React.ReactNode;
  style?: CSSProperties;
}
export function Layout(props: LayoutProps) {
  const { children, style: $styleBase } = props;
  const isInTab = useExtensionIsInTab();
  return (
    <div
      className="layout"
      style={Object.assign(
        {
          backgroundColor: '#09090A',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: window.location.pathname === '/sidePanel.html' ? '100vw' : '375px',
          minHeight: $styleBase?.minHeight || '600px',
          height:
            window.location.pathname === '/sidePanel.html'
              ? '100vh'
              : $styleBase?.height
              ? $styleBase?.height
              : '600px',
          overflowY: 'auto',
          overflowX: 'hidden',
          border: !isInTab ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          justifyContent: 'center'
        },
        $styleBase
      )}
    >
      {children}
    </div>
  );
}
