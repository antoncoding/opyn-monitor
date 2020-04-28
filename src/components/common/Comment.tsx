import React, { ReactChild } from 'react';

type commentProps = {
  text: string | ReactChild
}

function Comment({ text }: commentProps) {
  return (
    <div style={{ padding: 5, opacity: 0.5 }}>
      {text}
    </div>
  );
}

export default Comment;
