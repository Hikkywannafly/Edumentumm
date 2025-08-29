"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid3X3, List, Plus, Search } from "lucide-react";

/**
 * Example component demonstrating the global CSS classes for search and filter UI
 *
 * Available global CSS classes:
 *
 * Layout Classes:
 * - .filter-container: Main container with flexbox layout
 * - .search-filter-wrapper: Left side wrapper for search and filters
 * - .action-button-wrapper: Right side wrapper for action buttons
 *
 * Search Components:
 * - .search-input: Search input container
 * - .search-input-field: Search input field styling
 * - .search-icon: Search icon positioning
 *
 * Filter Components:
 * - .filter-dropdown: Dropdown container
 * - .filter-dropdown-trigger: Dropdown trigger styling
 *
 * View Toggle:
 * - .view-toggle: View mode toggle container
 * - .view-toggle-button: Individual toggle button
 *
 * Modern Layout:
 * - .modern-search-bar: Complete search bar with border and padding
 * - .search-section: Left section for search elements
 * - .actions-section: Right section for action buttons
 */

export function SearchFilterExample() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="font-semibold text-lg">Search & Filter UI Examples</h2>

      {/* Example 1: Basic Layout */}
      <div className="filter-container">
        <div className="search-filter-wrapper">
          <div className="search-input">
            <Search className="search-icon" />
            <Input
              placeholder="Search anything..."
              className="search-input-field"
            />
          </div>

          <Select>
            <SelectTrigger className="filter-dropdown-trigger w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="action-button-wrapper">
          <div className="view-toggle">
            <Button variant="default" size="sm" className="view-toggle-button">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="view-toggle-button">
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button>
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>

      {/* Example 2: Modern Search Bar */}
      <div className="modern-search-bar">
        <div className="search-section">
          <div className="search-input">
            <Search className="search-icon" />
            <Input
              placeholder="Search with modern styling..."
              className="search-input-field"
            />
          </div>

          <Select>
            <SelectTrigger className="filter-dropdown-trigger w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="actions-section">
          <Button variant="outline">Export</Button>
          <Button>Add Item</Button>
        </div>
      </div>

      {/* Example 3: Compact Layout */}
      <div className="filter-container">
        <div className="search-input">
          <Search className="search-icon" />
          <Input placeholder="Quick search..." className="search-input-field" />
        </div>

        <div className="action-button-wrapper">
          <Button variant="ghost" size="sm">
            Filter
          </Button>
          <Button size="sm">Add</Button>
        </div>
      </div>
    </div>
  );
}
