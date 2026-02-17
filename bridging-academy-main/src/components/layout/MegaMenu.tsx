import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MegaMenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  description?: string;
  featured?: boolean;
}

interface MegaMenuSection {
  label: string;
  items: MegaMenuItem[];
}

interface MegaMenuProps {
  label: string;
  sections: MegaMenuSection[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const MegaMenuDropdown = ({ label, sections, isOpen, onOpen, onClose }: MegaMenuProps) => {
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onOpen();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 200); // 200ms delay for stable hover
  };

  const isActive = (path: string) => location.pathname === path;
  const hasActiveChild = sections.some(section => section.items.some(item => isActive(item.path)));

  return (
    <div ref={menuRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={cn(
        "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        isOpen && "bg-accent text-accent-foreground",
        hasActiveChild && "text-primary"
      )}>
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 transition-all duration-200",
        isOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
      )}>
        <div className="bg-popover border border-border rounded-xl shadow-xl p-6 min-w-[420px] max-w-[520px]">
          <div className="grid gap-1">
            {sections.map((section, idx) => (
              <div key={idx}>
                {section.label && (
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.label}</h4>
                )}
                <div className="grid gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all duration-150 hover:bg-accent group",
                          isActive(item.path) && "bg-accent text-primary",
                          item.featured && "ring-2 ring-primary/50 bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg transition-colors bg-muted group-hover:bg-primary/10",
                          isActive(item.path) && "bg-primary/10",
                          item.featured && "bg-primary/20"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors",
                            isActive(item.path) && "text-primary",
                            item.featured && "text-primary"
                          )} />
                        </div>
                        <div className="flex-1">
                          <span className={cn(
                            "block text-sm font-medium",
                            isActive(item.path) && "text-primary",
                            item.featured && "text-primary font-semibold"
                          )}>
                            {item.label}
                            {item.featured && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">NEU</span>}
                          </span>
                          {item.description && <span className="block text-xs text-muted-foreground mt-0.5">{item.description}</span>}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileAccordionProps {
  label: string;
  sections: MegaMenuSection[];
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: () => void;
}

export const MobileAccordion = ({ label, sections, isOpen, onToggle, onItemClick }: MobileAccordionProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button onClick={onToggle} className={cn("flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-accent", isOpen && "bg-accent/50")}>
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
        <div className="bg-muted/30 py-2">
          {sections.map((section, idx) => (
            <div key={idx} className="px-4 py-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors hover:bg-accent",
                      isActive(item.path) && "bg-accent text-primary font-medium",
                      item.featured && "text-primary font-medium"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                    {item.featured && <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">NEU</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
