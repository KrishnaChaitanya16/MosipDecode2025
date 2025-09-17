import React from 'react';
import { styles } from '../../constants/styles';

const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    style={{
      ...styles.tabButton,
      ...(isActive ? styles.activeTab : styles.inactiveTab)
    }}
  >
    <Icon size={20} />
    {label}
  </button>
);

export default TabButton;
