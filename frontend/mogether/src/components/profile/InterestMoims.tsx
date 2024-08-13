import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import { MoimInterestApi, BungaeInterestApi } from "../../utils/api"; 여기는 slice에서 관리
import { RootState, AppDispatch } from "../../store/store";
import {MyInterestedMoim} from "../../store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectUserId } from "../../store/slices/authSlice";
import { Post } from "../../store/slices/userSlice";  //userSlice의 Post 기준! 왜냐면 여기서 내가 작성한 글을 관리하니까!
import { FaHeart } from "react-icons/fa";
import { fetchPosts, loadMorePosts, sortPostsByLatest, sortPostsByLikes, clickInterest, deleteInterest } from '../../store/slices/moimSlice';
import { locations } from '../../utils/location';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


const PostListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
`;

const PostCard = styled.div`
  background-color: lavender;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
`;

const HeartIcon = styled(FaHeart)<{ isInterested: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  color: ${(props) => (props.isInterested ? "red" : "white")};
  cursor: pointer;
  font-size: 24px;
`;

const PostInfo = styled.div`
  margin-top: 10px;
  width: 100%;
`;

const PostTitle = styled.h3`
  margin: 0;
  text-align: center;
`;

const KeywordContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-top: 10px;
`;

const KeywordButton = styled.div`
  padding: 5px 10px;
  background-color: #7848f4;
  color: #ffffff;
  border-radius: 5px;
  font-size: 14px;
  cursor: default;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const PostMetaInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const HostInfo = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 3px;
  gap: 5px;
  white-space: nowrap;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  span {
    text-align: center;
  }
`;

const ParticipantsImages = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;

  img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
  }
`;

const LoadMoreButton = styled.button`
  padding: 10px 20px;
  background-color: #7848f4;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Button = styled.button<{ selected: boolean }>`
  padding: 10px 20px;
  background-color: ${({ selected }) => (selected ? "#7848f4" : "#ffffff")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#000000")};
  border: 2px solid #7848f4;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #7848f4;
    color: #ffffff;
  }

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  gap: 5px;
`;

const ContentText = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 10px;
  text-align: center;
`;

const MyInterestMoim: React.FC = () => {
    const userId = Number(localStorage.getItem('userId')) || 0;
    const dispatch = useDispatch<AppDispatch>();
    const [interestCategory, setInterestCategory] = useState<string>("moim");
    const [myInterestMoim, setMyInterestMoim] = useState<Post[]>([]); 
    const [myInterestBungae, setMyInterestBungae] = useState<Post[]>([]); 
    const navigate = useNavigate();
    const [visiblePosts, setVisiblePosts] = useState<Post[]>([]); 

    useEffect(() => {
        const myInterestMoimList = async () => {
            try {
                const response = await dispatch(MyInterestedMoim(userId)).unwrap();
                setMyInterestMoim(response);
                setVisiblePosts(myInterestMoim.slice(0, 12));    
            }
            catch (error) {
                console.error(error);
            }
        };
        myInterestMoimList();
    }, [userId, dispatch]);

    

    
    
    // useEffect(() => {
    //     if (sortOrder === 'latest') {
    //       dispatch(sortPostsByLatest());
    //     } else {
    //       dispatch(sortPostsByLikes());
    //     }
    //   }, [sortOrder, dispatch]);
    
      const handleLoadMore = () => {
        dispatch(loadMorePosts());
      };
    
      const handleToggleInterest = async (moimId: number, interested: boolean) => {
        try {
          const response = await dispatch(clickInterest({ moimId: moimId, userId: userId })).unwrap();
          console.log(`Successfully toggled interest for post ${moimId}`);
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to toggle interest',
            text: 'There was an error toggling interest.',
          });
        }
      };

      const handleDelteInterest = async (moimId: number, interested: boolean) => {
        try {
          const response = await dispatch(deleteInterest({ moimId: moimId, userId: userId })).unwrap();
          console.log(`Successfully delete interest for post ${moimId}`);
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete interest',
            text: 'There was an error deleting interest.',
          });
        }
      }
    
    
      const handleCardClick = (moimId: number) => {
        navigate(`/moim/${moimId}`);
      };
      const customStyles = {
        control: (provided: any) => ({
          ...provided,
          borderRadius: "5px",
          padding: "5px",
          border: "1px solid #ccc",
          boxShadow: "none",
          "&:hover": {
            borderColor: "#7848f4",
          },
        }),
        menu: (provided: any) => ({
          ...provided,
          borderRadius: "5px",
        }),
        option: (provided: any, state: any) => ({
          ...provided,
          backgroundColor: state.isSelected
            ? "#7848f4"
            : state.isFocused
            ? "#f0f0f0"
            : "white",
          color: state.isSelected ? "white" : "black",
          "&:hover": {
            backgroundColor: "#7848f4",
            color: "white",
          },
        }),
      };
      const handleButtonClick = (category: string) => {
        if (category === "moim") {
          navigate("/interestedMoim");
        } else if (category === "bungae") {
          navigate("/interestedBungae");
        }
      };
    
      return (
        <PostListContainer>
      <ButtonGroup>
        <Button selected={true} onClick={() => handleButtonClick("moim")}>
          모임
        </Button>
        <Button selected={false} onClick={() => handleButtonClick("bungae")}>
          번개
        </Button>
      </ButtonGroup>

      <h1>My Interest Posts</h1>
      <PostGrid>
        {visiblePosts.map((post) => (
          <PostCard key={post.id} onClick={() => handleCardClick(post.id)}>
            <PostImage
              src={post.thumbnailUrl || "../../assets/default_image.png"}
              alt={post.title}
            />
            <HeartIcon
              isInterested={post.interested || false}
              onClick={(e) => {
                e.stopPropagation();
                {post.interested ? handleDelteInterest(post.id, post.interested || false) : handleToggleInterest(post.id, post.interested || false)}
              }}
            />
            <PostInfo>
              <PostTitle>{post.title}</PostTitle>
              <KeywordContainer>
                <KeywordButton>{post.keyword}</KeywordButton>
              </KeywordContainer>
              <ContentText>
                {post.content.length > 50
                  ? `${post.content.substring(0, 50)}...`
                  : post.content}
              </ContentText>
              <PostMetaInfo>
                <HostInfo>
                  <img
                    src={
                      post.hostProfileImageUrl ||
                      "../../assets/user_default.png"
                    }
                    alt={post.hostName}
                  />
                  <span>{post.hostName}</span>
                </HostInfo>
                <MetaInfo>
                  <span>
                    {post.createdAt} ~ {post.expireAt}
                  </span>
                  <span>
                    {post.address.city}, {post.address.gu}
                  </span>
                </MetaInfo>
              </PostMetaInfo>
              <PostMeta>
                <div>
                  <span>❤️ {post.interestsCount}</span>
                  <span>👥 {post.participantsCount}</span>
                </div>
                <ParticipantsImages>
                  {post.participantsImageUrls &&
                    post.participantsImageUrls
                      .slice(0, 6)
                      .map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`participant-${index}`}
                        />
                      ))}
                </ParticipantsImages>
              </PostMeta>
            </PostInfo>
          </PostCard>
        ))}
      </PostGrid>
      {visiblePosts.length < myInterestMoim.length && (
        <LoadMoreButton onClick={handleLoadMore}>Load more</LoadMoreButton>
      )}
    </PostListContainer>
      );
};

export default MyInterestMoim;