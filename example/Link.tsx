import React, { PropsWithChildren } from "react";

export interface ILinkProps {
  to?: string;
}

export const Link: React.FC<PropsWithChildren<ILinkProps>> = ({
  children,
  to
}) => {
  return <a href={to}>{children}</a>;
};
