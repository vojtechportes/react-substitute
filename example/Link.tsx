import React, { PropsWithChildren } from 'react';

export interface ILinkProps {
  to?: string;
}

export const Link: React.FC<PropsWithChildren<ILinkProps>> = ({
  children,
  to,
}) => <a href={to}>{children}</a>;
