'use client';

import React from 'react';
import { Dropdown } from 'flowbite-react';
import "../studentsTable/StudentsTable.css";

const SitesDropdown = ({ sites, onSiteSelected, selectedSite, additionalStyles, disableAllSites = false }) => {
  return (
    <Dropdown
      dismissOnClick={true}
      label={selectedSite || 'Select Site'}
      style={{
        minWidth: '185px',
        borderRadius: '13px',
        flexShrink: 0,
        color: '#000000',
        backgroundColor: '#FAFAFA',
        marginRight:'25px',
        ...additionalStyles,
      }}
      className="meal-count-btn"
    >
      {!disableAllSites && (
        <Dropdown.Item 
        className='meal-count-btn'
        onClick={() => onSiteSelected('')}>
          All Sites
        </Dropdown.Item>
      )}
      {sites.map((site) => (
        <Dropdown.Item
        className='meal-count-btn'
          key={site.spreadsheetId}
          onClick={() => onSiteSelected(site.name)}
        >
          {site.name}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

export default SitesDropdown;
