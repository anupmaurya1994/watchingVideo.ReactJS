import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Comments from "../components/Comments";
import Card from "../components/Card";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { dislike, fetchSuccess, like } from "../redux/videoSlice";
import { format } from "timeago.js";
import { subscription } from "../redux/userSlice";
import Recommendation from "../components/Recommendation";

const Container = styled.div`
  display: flex;
  gap: 24px;
`;

const Content = styled.div`
  flex: 5;
`;
const VideoWrapper = styled.div`
  position: relative;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 400;
  margin-top: 20px;
  margin-bottom: 10px;
  color: white;
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Info = styled.span`
  color: gray;
`;

const Buttons = styled.div`
  display: flex;
  gap: 20px;
  color: white;
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const Hr = styled.hr`
  margin: 15px 0px;
  border: 0.5px solid gray;
`;

const Channel = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ChannelInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

const ChannelDetail = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
`;

const ChannelName = styled.span`
  font-weight: 500;
`;

const ChannelCounter = styled.span`
  margin-top: 5px;
  margin-bottom: 20px;
  color: gray;
  font-size: 12px;
`;

const Description = styled.p`
  font-size: 14px;
`;

const Subscribe = styled.button`
  background-color: #cc1a00;
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 3px;
  height: max-content;
  padding: 10px 20px;
  cursor: pointer;
`;

const VideoFrame = styled.video`
  max-height: 720px;
  width: 100%;
  object-fit: cover;
  
`;

const Banner = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 10;
`;

const SkipBtn = styled.button`
    position: absolute;
    border: 1px solid black;
    background-color: #ffffff75;
    color: black;
    border-radius: 10px;
    z-index: 100;
    top: 601px;
    right: 17px;
    height: 27px;
    width: 70px;
    font-size: larger;
`

const Video = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo } = useSelector((state) => state.video);
  const dispatch = useDispatch();

  const path = useLocation().pathname.split("/")[2];

  const [channel, setChannel] = useState({});
  const [adsVideo, setAdsVideo] = useState([]);
  const [showBanner, setShowBanner] = useState(false);
  const [savedTime, setSavedTime] = useState(null);
  const [flag, setFlag] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoRes = await axios.get(`https://videoplayer-9bb8.onrender.com/api/videos/find/${path}`);
        const res = await axios.put(`https://videoplayer-9bb8.onrender.com/api/videos/view/${path}`);
        const adsvideoRes = await axios.get(`https://videoplayer-9bb8.onrender.com/api/adsvideo/findads`);

        setAdsVideo(adsvideoRes.data[0]);

        const channelRes = await axios.get(
          `https://videoplayer-9bb8.onrender.com/api/users/find/${videoRes.data.userId}`
        );
        setChannel(channelRes.data);
        dispatch(fetchSuccess(videoRes.data));
      } catch (err) {}
    };
    fetchData();
  }, [path, dispatch]);

  const handlePause = () => {
    console.log(videoRef.current)
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };


  const handleVideoTimeUpdate = () => {
    if (videoRef.current.currentTime > 45 && !showBanner && flag === true) {
      setShowBanner(true);
      handlePause();
      // videoRef.current.mute();
      setSavedTime(videoRef.current.currentTime); // Save the current time when pausing
      // videoRef.current.pause();
      setFlag(false)
    }
  };

  const handleBannerEnd = () => {
    if (showBanner) {
      setShowBanner(false);
      videoRef.current.play();
      if (savedTime) {
        videoRef.current.currentTime = savedTime; // Resume video at saved time
        setSavedTime(null); // Reset saved time after resuming
      }
    }
  };

  const handleLike = async () => {
    await axios.put(`https://videoplayer-9bb8.onrender.com/api/users/like/${currentVideo._id}`);
    dispatch(like(currentUser._id));
  };
  const handleDislike = async () => {
    await axios.put(`https://videoplayer-9bb8.onrender.com/api/users/dislike/${currentVideo._id}`);
    dispatch(dislike(currentUser._id));
  };

  const handleSub = async () => {
    currentUser.subscribedUsers.includes(channel._id)
      ? await axios.put(`https://videoplayer-9bb8.onrender.com/api/users/unsub/${channel._id}`)
      : await axios.put(`https://videoplayer-9bb8.onrender.com/api/users/sub/${channel._id}`);
    dispatch(subscription(channel._id));
  };

  const handleSkip = () => {
    if (showBanner) {
      setShowBanner(false);
      videoRef.current.play();
      if (savedTime) {
        videoRef.current.currentTime = savedTime; // Resume video at saved time
        setSavedTime(null); // Reset saved time after resuming
      }
    }
  }

  //TODO: DELETE VIDEO FUNCTIONALITY

  return (
    <Container>
      <Content>
      <VideoWrapper>
          {/* Banner */}
          {showBanner && (<>
            <Banner src={adsVideo?.videoUrl} autoPlay={showBanner} onEnded={handleBannerEnd} />
            <SkipBtn onClick={handleSkip}>Skip</SkipBtn></>
          )}
          {/* Main Video */}
          <VideoFrame
            ref={videoRef}
            src={currentVideo?.videoUrl}
            controls={true}
            muted={showBanner}
            autoPlay={!showBanner}
            onTimeUpdate={handleVideoTimeUpdate}
            controlsList="nodownload"
          />
         
        </VideoWrapper>
        <Title>{currentVideo?.title}</Title>
        <Details>
          <Info>
            {currentVideo?.views} views • {format(currentVideo?.createdAt)}
          </Info>
          <Buttons>
            <Button onClick={handleLike}>
              {currentVideo?.likes?.includes(currentUser?._id) ? (
                <ThumbUpIcon />
              ) : (
                <ThumbUpOutlinedIcon />
              )}{" "}
              {currentVideo?.likes?.length}
            </Button>
            <Button onClick={handleDislike}>
              {currentVideo?.dislikes?.includes(currentUser?._id) ? (
                <ThumbDownIcon />
              ) : (
                <ThumbDownOffAltOutlinedIcon />
              )}{" "}
              Dislike
            </Button>
            <Button>
              <ReplyOutlinedIcon /> Share
            </Button>
            <Button>
              <AddTaskOutlinedIcon /> Save
            </Button>
          </Buttons>
        </Details>
        <Hr />
        <Channel>
          <ChannelInfo>
            <Image src={channel?.img} />
            <ChannelDetail>
              <ChannelName>{channel?.name}</ChannelName>
              <ChannelCounter>{channel?.subscribers} subscribers</ChannelCounter>
              <Description>{currentVideo?.desc}</Description>
            </ChannelDetail>
          </ChannelInfo>
          <Subscribe onClick={handleSub}>
            {currentUser?.subscribedUsers?.includes(channel?._id)
              ? "SUBSCRIBED"
              : "SUBSCRIBE"}
          </Subscribe>
        </Channel>
        <Hr />
        <Comments videoId={currentVideo?._id} />
      </Content>
      <Recommendation tags={currentVideo?.tags} />
    </Container>
  );
};

export default Video;