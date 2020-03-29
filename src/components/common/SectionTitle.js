import React from 'react';
import PropTypes from 'prop-types';

function SectionTitle({ title }) {
  return <div style={{ padding: 10, fontSize: 20 }}>{title}</div>;
}

SectionTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

export default SectionTitle;
