import React, { Component } from 'react';
import axios from 'axios';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [
        {
          title: 'The marker`s title will appear as a tooltip.',
          name: 'Arnab',
          position: { lat: 22.5726, lng: 88.3639 },
        },
      ],
    };
    this.onClick = this.onClick.bind(this);
    // this.getMaxId = this.getMaxId.bind(this);
    // this.getData = this.getData.bind(this);
  }

  onClick(t, map, coord) {
    //const histData = JSON.parse(jData);
    const serverUrl = 'http://localhost:5678/aqi';
    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();
    const appid = '10c584214fe0d93a45fbc65300db142a';
    console.log(lat);
    console.log(lng);
    let url = `http://api.openweathermap.org/data/2.5/air_pollution?lon=${lng}&lat=${lat}&appid=${appid}`;
    axios.get(url).then((res) => {
      console.log(res.data);
      axios.post(serverUrl, res.data).then((response) => {
        console.log('Res delegated', res.data);
        console.log('Response From Node Server', response);
      });

      //   console.log(JSON.stringify(res.data));
      //   responseData = JSON.stringify(res.data);
      //   let jsonObj = JSON.parse(responseData);
      //   console.log('Invoking Node Server.');
      //   console.log('Node Invoked', jsonObj);
      // })
      // .then((jsonObj) => {
      //   axios.post('/aqi', jsonObj).then((response) => {
      //     console.log('Res delegated', jsonObj);
      //     console.log('Response From Node Server', response);
      //   });
    });

    this.setState((previousState) => {
      return {
        markers: [
          ...previousState.markers,
          {
            title: '',
            name: '',
            position: { lat, lng },
          },
        ],
      };
    });
  }

  render() {
    return (
      <>
        <Map
          google={this.props.google}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          className={'map'}
          zoom={14}
          onClick={this.onClick}
        >
          {this.state.markers.map((marker, index) => (
            <Marker
              key={index}
              title={marker.title}
              name={marker.name}
              position={marker.position}
            />
          ))}
        </Map>
      </>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAJauOQ-9IzgCRFTz-GNaMSVIxs1NgZRII',
})(App);
