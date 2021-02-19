import { MenuNode, menuVersionBranch } from '@/tools/menu/menu-structure-generator';
import { normaliseTitle } from '@/tools/utils/string';
import React, { useContext } from 'react';
import { Menu } from 'antd';
import { has, map } from 'lodash';
import Link from 'next/link';
import VersionedTitle from '@/components/layout/docs/menu/versioned-title';
import MenuContext from '@/components/layout/docs/menu/menu-context';
import { ReactNodeLike } from 'prop-types';
import { useSelector } from 'react-redux';
import { selectedVersionsSelector } from '@/logic/versions/selected-version-slice';

const { SubMenu, Item } = Menu;

const populateMenuRecursively = (collection: MenuNode, selections) => {
  // Todo sorting by item.meta.order
  return map(Object.entries(collection), ([key, item]) => {
    if (key === 'meta') return null;

    // menu item
    if (has(item, 'name')) {
      return (
        <Item key={`/docs/${item.meta.path}`}>
          <Link href="/docs/[...documentation-page]" as={`/docs/${item.meta.path}`}>
            <a>{item.name}</a>
          </Link>
        </Item>
      );
    }

    // container with versions
    if (key === menuVersionBranch) {
      const { meta, ...versions } = item;
      const selectedVersion = selections[meta.path];
      return map(Object.entries(versions), ([versionKey, versionCollection]) => {
        // Todo - take hardcoded selected version from globally selected version for meta.section
        return versionKey === selectedVersion
          ? populateMenuRecursively(versionCollection, selections)
          : [];
      });
    }

    // container with menu items
    return (
      <SubMenu key={key} title={normaliseTitle(key)}>
        {populateMenuRecursively(item, selections)}
      </SubMenu>
    );
  });
};

interface Props {
  section: string;
  title: ReactNodeLike;
  icon: ReactNodeLike;
}
const VersionedSubMenu = ({ section, title, icon, ...props }: Props) => {
  const selectedVersions = useSelector(selectedVersionsSelector);
  const { menuStructure } = useContext(MenuContext);
  const { docs } = menuStructure;

  return (
    <SubMenu {...props} icon={icon} title={<VersionedTitle section={section} title={title} />}>
      {populateMenuRecursively(docs[section], selectedVersions)}
    </SubMenu>
  );
};

export default VersionedSubMenu;