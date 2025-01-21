import { useEffect, useState, useRef } from "react";
import browser from "webextension-polyfill";
import { PageType, trackPage } from "~utils/analytics";
import styled from "styled-components";
import { Input, Section, useInput, Text } from "@arconnect/components-rebrand";
import AppIcon from "~components/popup/home/AppIcon";
import { apps, categories, type App } from "~utils/apps";
import { useTheme } from "~utils/theme";
import {
  ArrowLeft,
  ArrowRight,
  LinkExternal01
} from "@untitled-ui/icons-react";
import { getAppURL } from "~utils/format";
import WanderIcon from "url:assets/icon.svg";

export function ExploreView() {
  const [filteredApps, setFilteredApps] = useState(apps);
  const searchInput = useInput();
  const theme = useTheme();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 100;
      categoriesRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category === "All") {
      setFilteredApps(apps);
    } else {
      setFilteredApps(filterApps(apps, category));
    }
  };

  useEffect(() => {
    trackPage(PageType.EXPLORE);
  }, []);

  useEffect(() => {
    setFilteredApps(filterApps(apps, searchInput.state));
  }, [searchInput.state]);

  return (
    <Wrapper>
      <Header>
        <img src={WanderIcon} alt="Wander Icon" width={38.407} height={18} />
        <ScrollButton direction="left" onClick={() => scroll("left")}>
          <ArrowLeft height={20} width={20} />
        </ScrollButton>
        <Categories ref={categoriesRef}>
          {categories.map((category) => (
            <Category
              key={category.title}
              onClick={() => handleCategoryClick(category.title)}
            >
              <CategoryIcon as={category.icon} />
              {category.title}
            </Category>
          ))}
        </Categories>
        <ScrollButton direction="right" onClick={() => scroll("right")}>
          <ArrowRight height={20} width={20} />
        </ScrollButton>
      </Header>
      <Input
        {...searchInput.bindings}
        sizeVariant="small"
        variant="search"
        fullWidth
        placeholder="Search for an app"
      />
      <AppList>
        {filteredApps.map((app, index) => (
          <AppWrapper
            key={index}
            onClick={() => {
              browser.tabs.create({ url: app.links.website });
            }}
          >
            <LogoDescriptionWrapper>
              <LogoWrapper>
                <AppShortcut
                  bgColor={
                    theme === "light"
                      ? app.assets?.lightBackground
                      : app.assets?.darkBackground
                  }
                >
                  <Logo src={app.assets.logo} />
                </AppShortcut>
              </LogoWrapper>
              <Description>
                <Title>
                  <AppTitle>{app.name}</AppTitle>
                  <Pill>{app.category}</Pill>
                </Title>
                <AppDescription>{getAppURL(app.links.website)}</AppDescription>
              </Description>
            </LogoDescriptionWrapper>
            <IconWrapper />
          </AppWrapper>
        ))}
      </AppList>
    </Wrapper>
  );
}

const filterApps = (apps: App[], searchTerm: string = ""): App[] => {
  return apps.filter(
    (app: App) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const IconWrapper = styled(LinkExternal01)`
  height: 24px;
  width: 24px;
  cursor: pointer;
  color: ${(props) => props.theme.tertiaryText};
`;

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const Wrapper = styled(Section)`
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 100px;
  background: linear-gradient(
    180deg,
    #26126f 0%,
    ${({ theme }) => (theme.displayTheme === "dark" ? "#111" : "#f2f2f2")} 150px
  );
`;

const AppTitle = styled(Text).attrs({
  noMargin: true,
  weight: "semibold"
})``;

const Pill = styled.div`
  color: ${(props) => props.theme.primaryText};
  background-color: ${(props) => props.theme.backgroundSecondary};
  padding: 4px 8px;
  border-radius: 50px;
  border: 1px solid ${(props) => props.theme.inputField};
  box-sizing: border-box;

  font-size: 10px;
  font-weight: 400;
`;

const AppDescription = styled.p`
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.secondaryText};
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const Logo = styled.img`
  height: 40px;
  width: 40px;
`;

const AppWrapper = styled.button`
  padding-top: 8px;
  padding-bottom: 8px;
  gap: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
`;

const LogoDescriptionWrapper = styled.div`
  gap: 12px;
  display: flex;
`;

const AppShortcut = styled(AppIcon)<{ bgColor?: string }>`
  transition: all 0.125s ease-in-out;
  color: ${(props) => (props.bgColor ? props.bgColor : props.theme.background)};

  width: 40px;
  height: 40px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.92);
  }
`;

const Category = styled.div`
  flex-shrink: 0;
  display: flex;
  padding: 8px 12px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  &:active {
    background: rgba(${({ theme }) => theme.background}, 0.16);
    transform: scale(0.98);
  }
`;

const CategoryIcon = styled.div`
  height: 20px;
  width: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  position: relative;
`;

const ScrollButton = styled.button<{ direction: "left" | "right" }>`
  ${(props) => props.direction}: 0;

  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  opacity: 0.8;
  color: ${(props) => props.theme.primaryText};

  &:hover {
    opacity: 1;
  }
`;

const Categories = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: scroll;
  white-space: nowrap;
  cursor: default;
  width: 100%;
  flex: 1;
  min-width: 0;
`;

const AppList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
