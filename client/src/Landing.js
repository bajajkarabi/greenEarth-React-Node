import React, { Component } from 'react';
import axios from 'axios';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [
        {
          title: 'The marker`s title will appear as a tooltip.',
          name: 'Mumbai',
          position: { lat: 19.076, lng: 72.8777 },
        },
      ],
      responseData = '' ;
    };
    this.onClick = this.onClick.bind(this);
    
    // this.getMaxId = this.getMaxId.bind(this);
    // this.getData = this.getData.bind(this);
  }


  onClick(t, map, coord) {
    //const histData = JSON.parse(jData);

    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();

    console.log(lat);
    console.log(lng);
    let url = `https://greenearth-node.herokuapp.com/` + lat + `/` + lng;
    console.log('URL : ', url);

    const resData = () => {
      axios.get(url).then((res) => {
        console.log('Response From Node Server', res.data);
        setResponseData = res.data;
      });
    };

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
          style={{ position: 'absolute', width: '100%', height: '80%' }}
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
        {resData()}
      </>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAJauOQ-9IzgCRFTz-GNaMSVIxs1NgZRII',
})(Landing);
