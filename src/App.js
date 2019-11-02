import React from "react";
import "./App.css";
import Webcam from "react-webcam";

import stateCodes from "./config";
class App extends React.Component {
  setRef = webcam => {
    this.webcam = webcam;
  };

  submitToGoogle = async image => {
    try {
      //this.setState({ uploading: true });
      image = image.replace(/^data:image\/[a-z]+;base64,/, "");
      console.log(image);
      let body = JSON.stringify({
        requests: [
          {
            features: [{ type: "TEXT_DETECTION", maxResults: 5 }],
            image: {
              content: image
            }
          }
        ]
      });
      let googleResponse = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDNq70uDu_eTFEZm9-IndCgMZ4nWcbE-ME",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: body
        }
      );
      let responseJson = await googleResponse.json();
      let plateNo = responseJson.responses[0].fullTextAnnotation.text.toUpperCase();
      plateNo = plateNo.replace(/\s/g, "");
      plateNo = plateNo.replace("IND", "");
      console.log(plateNo);
      let serverResponse = await fetch(
        "http://3.226.83.4/searchForNumberPlate",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            vehicleNo: plateNo
          })
        }
      );
      let serverJson = await serverResponse.json();
      console.log(serverJson);
      if (serverJson.code == 200) console.log("Resident");
      else console.log("NonResident");
      // this.setState({
      //   googleResponse: responseJson,
      //   uploading: false
      // });
    } catch (error) {
      console.log(error.message);
    }
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();

    //console.log(imageSrc);
    this.submitToGoogle(imageSrc);
  };

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };

    return (
      <div>
        <Webcam
          id="videoElement"
          audio={false}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <button onClick={this.capture}>Capture photo</button>
      </div>
    );
  }
}

export default App;
