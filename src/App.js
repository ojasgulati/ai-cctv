import React from "react";
import "./App.css";
import Webcam from "react-webcam";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isScreenShotTaken: false,
      isGoogleResponseOk: false,
      isSendToNodejs: false,
      plateNo: null,
      plateNoType: null,
      residentDetails: null
    };
  }

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
      console.log(responseJson);
      let plateNo = responseJson.responses[0].fullTextAnnotation.text.toUpperCase();
      plateNo = plateNo.replace(/\s/g, "");
      plateNo = plateNo.replace("IND", "");
      console.log(plateNo);
      this.setState(state => ({
        isGoogleResponseOk: true,
        plateNo
      }));
      let serverResponse = await fetch(
        "http://3.233.69.105/searchForNumberPlate",
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
      this.setState(state => ({
        isSendToNodejs: true
      }));
      if (serverJson.code === 200)
        this.setState(state => ({
          plateNoType: "Residential Car\n" + JSON.stringify(serverJson.message)
        }));
      else
        this.setState(state => ({
          plateNoType: "Non-Residential Car"
        }));
      // this.setState({
      //   googleResponse: responseJson,
      //   uploading: false
      // });
    } catch (error) {
      console.log(error.message);
    }
  };

  capture = () => {
    this.setState(state => ({
      isScreenShotTaken: false,
      isGoogleResponseOk: false,
      isSendToNodejs: false,
      plateNo: null,
      plateNoType: null,
      residentDetails: null
    }));
    const imageSrc = this.webcam.getScreenshot();
    //console.log(imageSrc);
    if (imageSrc) {
      this.setState(state => ({
        isScreenShotTaken: true
      }));
      this.submitToGoogle(imageSrc, this.setState);
    }
  };

  render() {
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };
    const buttonClasses = makeStyles(theme => ({
      button: {
        margin: theme.spacing(1)
      },
      input: {
        display: "none"
      }
    }));

    return (
      <div id="container">
        <AppBar position="static">
          <Toolbar style={{ justifyContent: "center" }}>
            <Typography variant="h3">AI-CCTV</Typography>
          </Toolbar>
        </AppBar>
        <div class="split left">
          <div class="centered" style={{ margin: "40px 0px" }}>
            <Webcam
              id="videoElement"
              audio={false}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </div>
          <Button
            id="capture-photo"
            onClick={this.capture}
            variant="contained"
            color="primary"
            className={buttonClasses.button}
          >
            Capture photo
          </Button>
        </div>

        <div class="split right">
          <div class="centered card">
            <Card>
              <CardContent>
                {this.state.isScreenShotTaken && (
                  <>
                    <Typography
                      style={{ margin: "10px 0px" }}
                      variant="h5"
                      color="secondary"
                      gutterBottom
                    >
                      Screenshot taken
                    </Typography>
                    <Divider />
                  </>
                )}
                {this.state.isGoogleResponseOk && (
                  <>
                    <Typography
                      style={{ margin: "10px 0px" }}
                      variant="h5"
                      color="primary"
                    >
                      Image sent to google vision
                    </Typography>
                    <Typography
                      style={{ margin: "10px 0px" }}
                      variant="body2"
                      component="p"
                    >
                      Text Detected: <b>{this.state.plateNo}</b>
                    </Typography>
                    <Divider />
                  </>
                )}

                {this.state.isSendToNodejs && (
                  <>
                    <Typography
                      style={{ margin: "10px 0px" }}
                      variant="h5"
                      color="primary"
                    >
                      Text sent to node.js server
                    </Typography>
                    <Typography
                      style={{ margin: "10px 0px" }}
                      variant="body2"
                      component="p"
                    >
                      {this.state.plateNoType}
                    </Typography>
                    <Divider />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
