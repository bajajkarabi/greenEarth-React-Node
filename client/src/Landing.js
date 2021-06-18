import React, { Component, ReactRedirect, Route } from 'react';
import { Redirect } from 'react-router-dom'
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
      markers: [
        {
          title: 'The marker`s title will appear as a tooltip.',
          name: 'Mumbai',
          position: { lat: 19.0760, lng: 72.8777 },
        },
      ],
    };
    this.onClick = this.onClick.bind(this);
  }

  
  onClick(t, map, coord) {
    //const histData = JSON.parse(jData);

    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();

    console.log(lat);
    console.log(lng);

    let path = `/` + lat + `/` + lng;

    console.log("PATH : ", path);

    this.setState({ redirect: path });

    // axios.get(url).then((res) => {
    //     console.log('Response From Node Server', res);
    //   });

    // this.setState((previousState) => {

      // return {
      //   redirect: "www.google.com" ,
      //   markers: [
      //     ...previousState.markers,
      //     {
      //       title: '',
      //       name: '',
      //       position: { lat, lng },
      //     },
      //   ],
      // };
    //});
  }

  render() {

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }

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
})(Landing);
