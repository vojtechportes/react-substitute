import React, { PropsWithChildren } from 'react';

export const FauxLink: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => (
  <span style={{ textDecoration: 'underline', color: 'blue' }}>{children}</span>
);
