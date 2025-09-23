"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseLevel } from "@/types/course.type";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface FilterOptions {
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

interface CourseFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  maxPriceValue?: number;
}

export function CourseFilter({
  onFilterChange,
  maxPriceValue = 1000,
}: CourseFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    maxPriceValue,
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFilterChange({
      search: value.trim() === "" ? undefined : value.trim(),
    });
  }, 500);

  const debouncedPriceChange = useDebouncedCallback(
    (value: [number, number]) => {
      onFilterChange({
        minPrice: value[0] > 0 ? value[0] : undefined,
        maxPrice: value[1] < maxPriceValue ? value[1] : undefined,
      });
    },
    500,
  );

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    debouncedPriceChange(value);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(
      0,
      Math.min(Number.parseInt(e.target.value) || 0, priceRange[1] - 10),
    );
    handlePriceChange([newMin, priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.min(
      maxPriceValue,
      Math.max(
        Number.parseInt(e.target.value) || maxPriceValue,
        priceRange[0] + 10,
      ),
    );
    handlePriceChange([priceRange[0], newMax]);
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);

    if (value === "All Levels" || value === "all") {
      onFilterChange({
        level: undefined,
      });
    } else {
      onFilterChange({
        level: value as CourseLevel,
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setPriceRange([0, maxPriceValue]);

    onFilterChange({
      search: undefined,
      level: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="font-medium text-sm" htmlFor="course-search-input">
          Search Courses
        </label>
        <Input
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
          id="course-search-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="courseLevel" className="font-medium text-sm">
          Course Level
        </Label>
        <Select value={selectedLevel} onValueChange={handleLevelChange}>
          <SelectTrigger id="courseLevel">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {Object.values(CourseLevel).map((level) => (
              <SelectItem key={level} value={level}>
                {level.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label className="font-medium text-sm" htmlFor="dual-range-slider">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>

        {/* Dual Range Slider using CSS */}
        <div className="relative" id="dual-range-slider">
          <div className="relative h-2 rounded-lg bg-gray-200">
            {/* Active range visualization */}
            <div
              className="absolute h-2 rounded-lg bg-black"
              style={{
                left: `${(priceRange[0] / maxPriceValue) * 100}%`,
                width: `${((priceRange[1] - priceRange[0]) / maxPriceValue) * 100}%`,
              }}
            />
          </div>

          {/* Min range input */}
          <input
            type="range"
            min={0}
            max={maxPriceValue}
            step={10}
            value={priceRange[0]}
            onChange={(e) => handleMinPriceChange(e)}
            className="slider-thumb absolute h-2 w-full cursor-pointer appearance-none bg-transparent"
            style={{ zIndex: 1 }}
          />

          {/* Max range input */}
          <input
            type="range"
            min={0}
            max={maxPriceValue}
            step={10}
            value={priceRange[1]}
            onChange={(e) => handleMaxPriceChange(e)}
            className="slider-thumb absolute h-2 w-full cursor-pointer appearance-none bg-transparent"
            style={{ zIndex: 2 }}
          />
        </div>

        {/* Price inputs */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={handleMinPriceChange}
            className="w-20 text-sm"
            min={0}
            max={priceRange[1] - 10}
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={handleMaxPriceChange}
            className="w-20 text-sm"
            min={priceRange[0] + 10}
            max={maxPriceValue}
          />
        </div>

        <div className="flex justify-between text-muted-foreground text-xs">
          <span>$0</span>
          <span>${maxPriceValue}</span>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={clearFilters}
          className="text-muted-foreground text-sm underline hover:text-foreground"
        >
          Clear all filters
        </button>
      </div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #000;
          border: 2px solid #fff;
          cursor: pointer;
          box-shadow: 0 0 2px 0px #555;
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #000;
          border: 2px solid #fff;
          cursor: pointer;
          box-shadow: 0 0 2px 0px #555;
        }
      `}</style>
    </div>
  );
}
