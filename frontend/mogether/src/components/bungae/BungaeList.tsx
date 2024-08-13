import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchPosts, loadMorePosts, sortPostsByLatest, sortPostsByLikes, clickInterest } from '../../store/slices/bungaeSlice';
import styled from 'styled-components';
import { FaHeart } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Swal from 'sweetalert2';
import { locations } from '../../utils/location';
import { searchPosts } from '../../store/slices/bungaeSlice';
import {useNavigate} from "react-router-dom";
import Select, {SingleValue} from "react-select";


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
  cursor: pointer; // 클릭 가능하도록 커서 변경
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
  white-space: nowrap; // 줄바꿈 방지

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

const SortSelect = styled.select`
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  align-self: flex-end;

  @media (max-width: 768px) {
    align-self: center;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
  width: 100%;
`;

const SearchBackground = styled.div`
  width: 100%;
  height: 200px;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: contain;
  opacity: 0.3;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 80%;
  z-index: 1;
  // border: 1px solid #ccc;
  padding: 5px;
  // border-radius: 5px;
  // background-color: lavender; /* 반투명 보라색 배경 */

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  flex: 1;
  min-width: 200px;
  position: relative;
  white-space: nowrap; // 줄바꿈 방지
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background-color: #7848f4;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #5c3bbf;
    transform: translateY(-3px);
  }
`;
const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BungaeList = () => {
  const dispatch: AppDispatch = useDispatch();
  const { visiblePosts, allPosts, loading, error } = useSelector((state: RootState) => state.bungae);
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [subLocation, setSubLocation] = useState('');
  const userId = localStorage.getItem('userId') || 0;
  const navigate = useNavigate();
  
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    if (sortOrder === 'latest') {
      dispatch(sortPostsByLatest());
    } else {
      dispatch(sortPostsByLikes());
    }
  }, [sortOrder, dispatch]);

  const handleLoadMore = () => {
    dispatch(loadMorePosts());
  };

  const handleToggleInterest = async (bungaeId: number, interested: boolean) => {
    try {
      const response = await dispatch(clickInterest({ bungaeId: bungaeId, userId: userId })).unwrap();
      console.log(`Successfully toggled interest for post ${bungaeId}`);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to toggle interest',
        text: 'There was an error toggling interest.',
      });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm && !location && !subLocation) {
      Swal.fire({
        icon: 'warning',
        title: '검색어를 입력하세요',
        text: '이름, 시, 구 중 하나 이상을 입력하세요.',
      });
      return;
    }

    try {
      await dispatch(searchPosts({ name: searchTerm, city: location, gu: subLocation })).unwrap();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '검색 실패',
        text: '검색 중 오류가 발생했습니다. 다시 시도하세요.',
      });
    }
  };

  const handleCardClick = (bungaeId: number) => {
    navigate(`/bungae/${bungaeId}`);
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

  return (
    <PostListContainer>
      <SearchContainer>
        <SearchBackground>
          <BackgroundImage src={require("../../assets/Computer.png")} alt="Background" />
          <SearchInputWrapper>
            <SearchInput
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              styles={customStyles}
              options={locations.map((loc) => ({
                value: loc.name,
                label: loc.name,
              }))}
              placeholder="행정시를 선택하세요"
              value={location ? { value: location, label: location } : null}
              onChange={(selectedOption: SingleValue<{ label: string; value: string }>) =>
                setLocation(selectedOption?.value || "")  //만약 null이면 ""으로 설정
              }
            />
            <Select
              styles={customStyles}
              options={
                location
                  ? locations
                      .find((loc) => loc.name === location)
                      ?.subArea.map((sub) => ({ value: sub, label: sub })) || []
                  : []
              }
              placeholder="행정구를 선택하세요"
              value={
                subLocation ? { value: subLocation, label: subLocation } : null
              }
              onChange={(selectedOption:SingleValue<{ label: string; value: string }>) =>
                setSubLocation(selectedOption ? selectedOption.value : "")
              }
              isDisabled={!location}
            />
            <SearchButton onClick={handleSearch}>
              <IoSearch size={24} />
            </SearchButton>
          </SearchInputWrapper>
        </SearchBackground>
      </SearchContainer>
      <SortSelect
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="latest">최신순</option>
        <option value="likes">좋아요순</option>
      </SortSelect>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
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
                  e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                  handleToggleInterest(post.id, post.interested || false);
                }}
              />
              <PostInfo>
                <PostTitle>{post.title}</PostTitle>
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
        {visiblePosts.length < allPosts.length && (
          <LoadMoreButton onClick={handleLoadMore}>Load more</LoadMoreButton>
        )}
        </>
      )}
    </PostListContainer>
  );
};

export default BungaeList;
