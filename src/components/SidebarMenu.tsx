"use client"

import { toKebabCase } from "@/lib/string"
import { usePathname } from "next/navigation"
import { Button } from "./ui/Button"
import { Icon, IconNames } from "./ui/Icon"

type SidebarMenuLink = {
    label: string
    path: string
    icon?: IconNames
}

type SidebarMenuDropdown = {
    label: string
    icon?: IconNames
    items: SidebarMenuLink[]
}

type SidebarMenuGroupItem = SidebarMenuLink | SidebarMenuDropdown

export type SidebarMenuGroup = {
    label?: string
    items: SidebarMenuGroupItem[]
}

const SidebarMenuItem = ({ item }: { item: SidebarMenuGroupItem }) => {
    const pathname = usePathname()
    const { label, icon } = item

    if ("path" in item) {
        return (
            <li className="sidebar-menu-item">
                <Button
                    color="neutral"
                    variant="ghost"
                    shape="rectangle"
                    className={`sidebar-menu-link${pathname === item.path ? " active" : ""}`}
                    href={item.path}
                    aria-current={pathname === item.path ? "page" : undefined}
                >
                    {icon && <Icon name={icon} />}
                    <span>{label}</span>
                </Button>
            </li>
        )
    }

    const checkboxId = `sidebar-menu-${toKebabCase(label)}-toggle`
    const isOpen = item.items.some(({ path }) => path === pathname)

    return (
        <li className="sidebar-menu-item">
            <input
                id={checkboxId}
                className="sidebar-menu-toggle"
                type="checkbox"
                defaultChecked={isOpen}
                aria-label={`Toggle ${label} submenu`}
            />
            <label
                className="sidebar-menu-toggle-label"
                htmlFor={checkboxId}
                aria-expanded={isOpen}
                role="button"
                tabIndex={0}
            >
                {icon && <Icon name={icon} />}
                <span>{label}</span>
                <Icon name="chevron-down" />
            </label>
            <ul className="sidebar-menu-dropdown-list" style={{ height: `${item.items.length * 2}rem` }} role="menu">
                {item.items.map((dropdownItem) =>
                    <li className="sidebar-menu-dropdown-item" key={dropdownItem.path} role="none">
                        <Button
                            color="neutral"
                            variant="ghost"
                            shape="rectangle"
                            className={`sidebar-menu-link${pathname === dropdownItem.path ? " active" : ""}`}
                            href={dropdownItem.path}
                            aria-current={pathname === dropdownItem.path ? "page" : undefined}
                        >
                            {dropdownItem.icon && <Icon name={dropdownItem.icon} />}
                            <span>{dropdownItem.label}</span>
                        </Button>
                    </li>
                )}
            </ul>
        </li>
    )
}

export default function SidebarMenu({ groups }: { groups: SidebarMenuGroup[] }) {
    return (
        <nav className="sidebar-menu" aria-label="Sidebar navigation">
            {groups.map(({ label, items }, groupIndex) =>
                <div className="sidebar-menu-group" key={groupIndex}>
                    {label && <span className="sidebar-menu-group-label">{label}</span>}
                    <ul className="sidebar-menu-group-list" role="menu">
                        {items.map((item, itemIndex) =>
                            <SidebarMenuItem item={item} key={itemIndex} />
                        )}
                    </ul>
                </div>
            )}
        </nav>
    )
}