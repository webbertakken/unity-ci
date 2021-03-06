import React from 'react';
import { ReactNodeLike } from 'prop-types';
import { Anchor } from 'antd';
import { extractAnchorId } from '@/tools/search/utils/extract-sections';

const { Link } = Anchor;

interface Props {
  level: number;
  children: ReactNodeLike;
}

const AnchorItem = ({ level, children }: Props) => {
  if (level >= 6) {
    return null;
  }

  const value = React.Children.toArray(children)[0];
  const anchorId = extractAnchorId(value);

  // styles
  const paddingLeft = level * 8 - 8;
  const fontSize = `${120 - level * 10}%`;

  return (
    <div style={{ paddingLeft, fontSize }}>
      <Link href={`#${anchorId}`} title={value} />
    </div>
  );
};

export default AnchorItem;
