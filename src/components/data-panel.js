import React, { Component } from 'react';
import { isNullOrUndefined, isNumber } from 'util';

const alwaysOnFields = ['time', 'Sog', 'Cog', 'Twa', 'Tws', 'Awa', 'Aws', 'coordinates', 'previousCoordinates'];

export function DataWindow({segment}) {
  console.log("DataWinfow props", segment);

  if (isNullOrUndefined(segment)) {
    segment = alwaysOnFields.reduce( (s, f) => {
      s[f] = null;
      return s;
    }, {});
  }

  let otherprops = Object.keys(segment).reduce( (otherprops, key) => {
    if (!alwaysOnFields.includes(key)) {
      otherprops[key] = segment[key];
    }
    return otherprops;
  }, {});

  let otherPanelItems = Object.keys(otherprops).map(key => {
    return <DataPanelItem key={ key } data={ key } unit="-" value={segment[key]} />
  });
  return (
    <div className="data-window">
      <DataPanel>
        <DataPanelItem data="Time" unit="Locale" value={segment.time} type="date" large={true} />
        <DataPanelItem data="SOG" unit="kts" value={segment.Sog} />
        <DataPanelItem data="COG" unit="T?" value={segment.Cog} fractionDigits={0}/>
        <DataPanelItem data="TWA" unit="" value={segment.Twa} fractionDigits={0}/>
        <DataPanelItem data="TWS" unit="kts" value={segment.Tws} />
        <DataPanelItem data="AWA" unit="" value={segment.Awa} fractionDigits={0}/>
        <DataPanelItem data="AWS" unit="kts" value={segment.Aws} />
        { otherPanelItems }
      </DataPanel>
    </div>
  );
}

export function DataPanel(props) {
  return (
    <div className="data-panel">
      {props.children}
    </div>
  )
}

export function DataPanelItem(props) {
  let value = props.value;
  let unit = props.unit;
  let data = props.data;

  if (value instanceof Date) {
    value = props.value.toLocaleTimeString();
    unit = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
  }
  else if (isNumber(value)) {
    let fractionDigits = 'fractionDigits' in props ? props.fractionDigits : 1;
    value = props.value.toFixed(fractionDigits);
  }
  else {
    if (isNullOrUndefined(value)) {
      value = "-";
    }
  }
  return (
    <div className={ props.large ? "data-panel-item data-panel-item-large" : "data-panel-item" }>
      <span className="data">{data}</span>
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  )
}

