// LMS Module - Learning Management System Components and Logic
// This module contains all LMS-related functionality separated from the main portfolio

import React, { useState, useEffect } from 'react';

// No mock data - using real Moodle API data only

// Dashboard Component
const Dashboard = ({ courses, onCourseSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter courses based on search query
    const filteredCourses = courses.filter(course => {
        const query = searchQuery.toLowerCase();
        return (
            course.name?.toLowerCase().includes(query) ||
            course.code?.toLowerCase().includes(query) ||
            course.fullname?.toLowerCase().includes(query) ||
            course.shortname?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="max-w-7xl mx-auto animation-fade-in text-white p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">Course Overview</h1>
                <p className="text-gray-400 mt-1 text-sm">Select a course to view assignments and materials</p>
            </div>

            {/* Search Box */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-lg border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all text-white bg-black/40 placeholder-gray-500"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-sm text-gray-400 mt-2">
                        Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-400">No courses found matching "{searchQuery}"</p>
                    </div>
                ) : (
                    filteredCourses.map((course, index) => {
                        // Alternate gradient styles - More variety
                        const gradients = [
                            'bg-gradient-to-br from-[#00ff88] via-[#00e5a0] to-[#ffaa00]', // Green to Yellow
                            'bg-gradient-to-br from-[#667eea] to-[#764ba2]', // Purple
                            'bg-gradient-to-br from-[#f093fb] to-[#f5576c]', // Pink to Red
                            'bg-gradient-to-br from-[#4facfe] to-[#00f2fe]', // Blue
                            'bg-gradient-to-br from-[#43e97b] to-[#38f9d7]', // Mint Green
                            'bg-gradient-to-br from-[#fa709a] to-[#fee140]', // Pink to Yellow
                            'bg-gradient-to-br from-[#30cfd0] to-[#330867]', // Cyan to Purple
                            'bg-gradient-to-br from-[#a8edea] to-[#fed6e3]', // Pastel Blue to Pink
                            'bg-gradient-to-br from-[#ff9a56] to-[#ff6a88]', // Orange to Pink
                            'bg-gradient-to-br from-[#ffecd2] to-[#fcb69f]', // Peach
                        ];

                        const borderColors = [
                            'border-[#00ff88]/20',
                            'border-[#667eea]/20',
                            'border-[#f093fb]/20',
                            'border-[#4facfe]/20',
                            'border-[#43e97b]/20',
                            'border-[#fa709a]/20',
                            'border-[#30cfd0]/20',
                            'border-[#a8edea]/20',
                            'border-[#ff9a56]/20',
                            'border-[#ffecd2]/20',
                        ];

                        const gradient = gradients[index % gradients.length];
                        const borderColor = borderColors[index % borderColors.length];
                        const isDark = index % 5 === 1;

                        return (
                            <div
                                key={course.id}
                                onClick={() => onCourseSelect(course.id)}
                                className={`${gradient} rounded-2xl border ${borderColor} p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden shadow-xl`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isDark
                                        ? 'bg-white/10 text-white'
                                        : 'bg-black/20 text-black'
                                        }`}>
                                        {course.code}
                                    </div>
                                    <button className={`p-1.5 rounded-lg ${isDark
                                        ? 'hover:bg-white/10'
                                        : 'hover:bg-black/10'
                                        } transition-colors`}>
                                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Course Name */}
                                <h2 className={`text-xl font-bold mb-3 line-clamp-2 ${isDark ? 'text-white' : 'text-black'
                                    }`}>
                                    {course.name}
                                </h2>

                                {/* Description */}
                                <p className={`text-sm line-clamp-2 mb-6 ${isDark ? 'text-gray-300' : 'text-black/70'
                                    }`}>
                                    {course.description || 'View course materials and assignments'}
                                </p>

                                {/* Footer - Stats */}
                                <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'
                                    } flex items-center justify-between`}>
                                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-black/60'
                                        }`}>
                                        Semester 1/2026
                                    </span>
                                    <span className={`text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform ${isDark ? 'text-white' : 'text-black'
                                        }`}>
                                        View
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// CourseDetails Component - Full Course + Assignments Only for THIS Course
const CourseDetails = ({ courseId, courses, assignments, contents, highlightedId, onBack }) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [contentWidth, setContentWidth] = useState(60); // percentage
    const [isResizing, setIsResizing] = useState(false);

    const course = courses.find(c => c.id === courseId);
    const courseAssignments = assignments.filter(a => a.courseId === courseId && a.type === 'assignment');
    const courseQuizzes = assignments.filter(a => a.courseId === courseId && a.type === 'quiz');

    // Toggle section expansion
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Handle panel resizing
    const handleMouseDown = (e) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const container = document.getElementById('course-container');
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Limit width between 30% and 80%
            if (newWidth >= 30 && newWidth <= 80) {
                setContentWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Scroll to highlighted task
    useEffect(() => {
        if (highlightedId) {
            setTimeout(() => {
                const element = document.getElementById(highlightedId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('animate-highlight-glow');
                }
            }, 500);
        }
    }, [highlightedId, contents]);

    if (!course) return <div className="text-white text-center mt-10">Course not found</div>;

    const formatDate = (dateString, timestamp) => {
        const date = timestamp ? new Date(timestamp * 1000) : new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const ModuleItem = ({ mod }) => {
        let icon = (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        );
        if (mod.modname === 'url') icon = <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;

        return (
            <div className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                <div className="shrink-0 pt-1">{icon}</div>
                <div className="flex-1 min-w-0">
                    <a href={mod.url} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-[#00ff88] font-medium block truncate transition-colors">
                        {mod.name}
                    </a>
                    {mod.description && <div className="text-xs text-gray-500 mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: mod.description }}></div>}
                </div>
                {mod.modname === 'assign' || mod.modname === 'quiz' ? (
                    <span className="text-[10px] uppercase bg-[#00ff88]/10 text-[#00ff88] px-2 py-0.5 rounded border border-[#00ff88]/20">Task</span>
                ) : null}
            </div>
        )
    }

    const AssignmentCard = ({ item }) => {
        const isHighlighted = highlightedId === item.id;
        return (
            <div
                key={item.id}
                id={item.id}
                className={`bg-[#1a1a1a] rounded-xl p-4 border overflow-hidden relative transition-all duration-300 flex flex-col gap-3 group mb-3 ${isHighlighted
                    ? 'border-[#00ff88] shadow-lg shadow-[#00ff88]/20'
                    : 'border-white/10 hover:border-[#00ff88]/30'
                    }`}
            >
                {isHighlighted && <div className="absolute inset-0 border-2 border-[#00ff88] rounded-xl pointer-events-none"></div>}

                <div className="relative z-10 flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg shrink-0 ${item.type === 'quiz'
                        ? 'bg-purple-500/15 text-purple-300'
                        : 'bg-[#00ff88]/15 text-[#00ff88]'
                        }`}>
                        {item.type === 'quiz' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-sm font-bold transition-colors ${isHighlighted ? 'text-[#00ff88]' : 'text-white'}`}>
                            {item.name || item.title}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1.5 text-xs text-gray-400">
                            <span className="flex items-center text-red-300">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Due {formatDate(item.dueDate, item.duedate)}
                            </span>
                        </div>
                    </div>
                </div>

                <a
                    href={item.externalLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 w-full py-2 bg-[#00ff88] hover:bg-[#00ff9d] text-black text-xs font-semibold rounded-lg transition-all text-center"
                >
                    {item.type === 'quiz' ? 'Attempt' : 'View'}
                </a>
            </div>
        );
    };

    return (
        <div className="max-w-full mx-auto animation-fade-in text-white h-full flex flex-col gap-4 p-4">
            <button
                onClick={onBack}
                className="flex items-center text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Dashboard
            </button>

            {/* Course Header - More compact */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 relative overflow-hidden shrink-0">
                <div className="relative z-10">
                    <span className="text-[#00ff88] font-semibold tracking-wide text-xs flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-lg shadow-[#00ff88]/50"></span>
                        {course.code || course.shortname}
                    </span>
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">{course.name || course.fullname}</h1>
                    <div className="text-gray-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: course.description || course.summary || "No description provided." }}></div>
                </div>
            </div>

            {/* Resizable Content Area - Desktop only, Stack on mobile */}
            <div id="course-container" className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden relative">
                {/* Left Column: Course Content (Resizable on desktop) */}
                <div
                    className="flex flex-col overflow-hidden w-full lg:w-auto"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${contentWidth}%` : '100%' }}
                >
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Course Content
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {(!contents || contents.length === 0) ? (
                            <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-white/10">
                                <p className="text-gray-400 italic">No course content available</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contents.map(section => {
                                    const isExpanded = expandedSections[section.id] !== false; // Default to expanded
                                    return (
                                        <div key={section.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                                            {/* Section Header - Clickable */}
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className="w-full p-4 bg-white/5 border-b border-white/5 flex justify-between items-center hover:bg-white/8 transition-colors"
                                            >
                                                <h3 className="font-bold text-white text-left">{section.name}</h3>
                                                <svg
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Section Content - Collapsible */}
                                            {isExpanded && (
                                                <div className="p-2">
                                                    {section.modules && section.modules.length > 0 ? (
                                                        section.modules.map(mod => <ModuleItem key={mod.id} mod={mod} />)
                                                    ) : (
                                                        <div className="p-4 text-sm text-gray-600 italic">No content in this section.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Resize Handle - Desktop only */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`hidden lg:block w-1 bg-white/10 hover:bg-[#00ff88] cursor-col-resize transition-colors relative ${isResizing ? 'bg-[#00ff88]' : ''}`}
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-12 flex items-center justify-center">
                        <div className="w-1 h-8 bg-white/20 rounded"></div>
                    </div>
                </div>

                {/* Right Column: Upcoming Tasks */}
                <div
                    className="flex flex-col overflow-hidden w-full lg:w-auto lg:min-w-[280px]"
                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - contentWidth - 1}%` : '100%' }}
                >
                    <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-xl overflow-hidden h-full flex flex-col">
                        <div className="bg-[#00ff88]/10 p-4 border-b border-[#00ff88]/20 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-[#00ff88] flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Upcoming Tasks
                            </h3>
                            <span className="bg-[#00ff88]/20 text-xs px-2.5 py-1 rounded-lg text-[#00ff88] font-semibold border border-[#00ff88]/20">{courseAssignments.length + courseQuizzes.length}</span>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
                            {/* Assignments List */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Assignments</h4>
                                {courseAssignments.length === 0 ? <p className="text-gray-600 text-sm">No assignments.</p> : (
                                    <div className="space-y-3">
                                        {courseAssignments.map(a => (
                                            <AssignmentCard key={a.id} item={a} highlightedId={highlightedId} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quizzes List */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quizzes</h4>
                                {courseQuizzes.length === 0 ? <p className="text-gray-600 text-sm">No Quizzes.</p> : (
                                    <div className="space-y-3">
                                        {courseQuizzes.map(q => (
                                            <AssignmentCard key={q.id} item={q} highlightedId={highlightedId} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern Google Calendar-Style Calendar Component
const Calendar = ({ courses, assignments, onNavigateToCourse }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [expandedDays, setExpandedDays] = useState({});
    const [showMoreModal, setShowMoreModal] = useState(null);
    const [viewMode, setViewMode] = useState('month'); // 'today', 'week', 'month'
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [hideLongEvents, setHideLongEvents] = useState(false); // New state for filtering
    const [isMobileView, setIsMobileView] = useState(false); // Track if mobile
    const [showWelcomeModal, setShowWelcomeModal] = useState(false); // Welcome modal for mobile
    const [hasChosenView, setHasChosenView] = useState(false); // Track if user has chosen a view
    const MAX_VISIBLE_EVENTS = 3; // Limit events shown per day

    // Detect mobile view and show welcome modal
    useEffect(() => {
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            setIsMobileView(isMobile);

            // Show welcome modal only on mobile and only once
            if (isMobile && !hasChosenView) {
                setShowWelcomeModal(true);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [hasChosenView]);

    // Handle view selection from welcome modal
    const handleViewSelection = (mode) => {
        setViewMode(mode);
        setHasChosenView(true);
        setShowWelcomeModal(false);

        // Auto-hide long events for today/week view
        if (mode === 'today' || mode === 'week') {
            setHideLongEvents(true);
        }
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => {
        setCurrentDate(new Date());
        setViewMode('today');
    };

    // Helper function to check if a date is today
    const isDueToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Helper function to check if a date should be highlighted based on view mode
    const isInViewRange = (date) => {
        if (viewMode === 'month') return false; // No highlight in month view

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        if (viewMode === 'today') {
            // Highlight only today
            return checkDate.getTime() === today.getTime();
        }

        if (viewMode === 'week') {
            // Highlight current week (Sunday to Saturday)
            const dayOfWeek = today.getDay();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - dayOfWeek);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            return checkDate >= weekStart && checkDate <= weekEnd;
        }

        return false;
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => {
            if (showViewDropdown) setShowViewDropdown(false);
        };
        if (showViewDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showViewDropdown]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Generate days array
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));

    // Course color mapping with better contrast
    const getCourseColor = (courseId) => {
        const colorPalette = [
            { bg: 'bg-blue-500/60', border: 'border-l-blue-500', text: 'text-blue-50', hover: 'hover:bg-blue-500/70' },
            { bg: 'bg-emerald-500/60', border: 'border-l-emerald-500', text: 'text-emerald-50', hover: 'hover:bg-emerald-500/70' },
            { bg: 'bg-purple-500/60', border: 'border-l-purple-500', text: 'text-purple-50', hover: 'hover:bg-purple-500/70' },
            { bg: 'bg-orange-500/60', border: 'border-l-orange-500', text: 'text-orange-50', hover: 'hover:bg-orange-500/70' },
            { bg: 'bg-pink-500/60', border: 'border-l-pink-500', text: 'text-pink-50', hover: 'hover:bg-pink-500/70' },
            { bg: 'bg-cyan-500/60', border: 'border-l-cyan-500', text: 'text-cyan-50', hover: 'hover:bg-cyan-500/70' },
            { bg: 'bg-red-500/60', border: 'border-l-red-500', text: 'text-red-50', hover: 'hover:bg-red-500/70' },
            { bg: 'bg-teal-500/60', border: 'border-l-teal-500', text: 'text-teal-50', hover: 'hover:bg-teal-500/70' },
        ];
        const index = courses.findIndex(c => c.id === courseId);
        return colorPalette[index >= 0 ? index % colorPalette.length : 0];
    };

    // Process events for the month
    const processedEvents = assignments.map(a => {
        const due = new Date(a.dueDate);
        const start = a.startDate ? new Date(a.startDate) : due;

        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(due);
        endDate.setHours(0, 0, 0, 0);

        const course = courses.find(c => c.id === a.courseId);
        const colors = getCourseColor(a.courseId);

        return {
            ...a,
            startDate: startDate,
            dueDate: endDate,
            courseName: course ? course.code : 'Unknown',
            courseFullName: course ? course.name : 'Unknown',
            colors: colors,
            duration: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        };
    });

    // Group events by course and date range
    const groupedEvents = [];
    const eventGroups = new Map();

    processedEvents.forEach(event => {
        const key = `${event.courseId}-${event.startDate.getTime()}-${event.dueDate.getTime()}`;
        if (!eventGroups.has(key)) {
            eventGroups.set(key, {
                ...event,
                groupedTasks: [event],
                taskCount: 1
            });
        } else {
            const existing = eventGroups.get(key);
            existing.groupedTasks.push(event);
            existing.taskCount++;
        }
    });

    eventGroups.forEach(group => groupedEvents.push(group));

    // Get events for a specific date - simplified, no complex row calculation
    const getEventsForDate = (date) => {
        if (!date) return [];
        return groupedEvents.filter(event => {
            const start = event.startDate;
            const end = event.dueDate;
            return date >= start && date <= end;
        }).sort((a, b) => {
            // Sort by due date (earliest first) - tasks ending soonest appear at the top
            if (a.dueDate.getTime() !== b.dueDate.getTime()) {
                return a.dueDate - b.dueDate;
            }
            // If same due date, prefer shorter duration tasks
            if (a.duration !== b.duration) {
                return a.duration - b.duration;
            }
            // Fallback to course ID
            return a.courseId < b.courseId ? -1 : 1;
        });
    };

    // Helper to get only visible events (row < MAX_VISIBLE_ROWS) for a date
    const getVisibleEventsForDate = (date, allEventsWithRows) => {
        if (!date) return [];
        const MAX_VISIBLE_ROWS = 3;
        return allEventsWithRows.filter(event => {
            if (event.row >= MAX_VISIBLE_ROWS) return false;
            const start = event.startDate;
            const end = event.dueDate;
            return date >= start && date <= end;
        });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const toggleDayExpansion = (dateStr) => {
        setExpandedDays(prev => ({
            ...prev,
            [dateStr]: !prev[dateStr]
        }));
    };

    // Precompute events with row assignments for the current view
    const allEventsWithRows = React.useMemo(() => {
        const MAX_VISIBLE_ROWS = 3;

        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        let filterStart, filterEnd;
        const maxDuration = {
            'today': 1,
            'week': 7,
            'month': 45
        }[viewMode] || 999;

        if (viewMode === 'today') {
            filterStart = today;
            filterEnd = todayEnd;
        } else if (viewMode === 'week') {
            filterStart = weekStart;
            filterEnd = weekEnd;
        } else {
            filterStart = monthStart;
            filterEnd = monthEnd;
        }

        const monthEvents = groupedEvents.filter(event => {
            const inRange = event.dueDate >= filterStart && event.startDate <= filterEnd;
            if (!inRange) return false;
            if (hideLongEvents && event.duration > maxDuration) return false;
            return true;
        }).sort((a, b) => {
            if (a.dueDate.getTime() !== b.dueDate.getTime()) {
                return a.dueDate - b.dueDate;
            }
            if (a.duration !== b.duration) {
                return a.duration - b.duration;
            }
            return a.courseId < b.courseId ? -1 : 1;
        });

        const eventRows = [];
        monthEvents.forEach(event => {
            let row = 0;
            while (true) {
                if (!eventRows[row]) eventRows[row] = [];
                const hasConflict = eventRows[row].some(existing =>
                    !(event.dueDate < existing.startDate || event.startDate > existing.dueDate)
                );
                if (!hasConflict) {
                    eventRows[row].push({ ...event, row });
                    break;
                }
                row++;
            }
        });

        return eventRows.flat();
    }, [groupedEvents, currentDate, viewMode, hideLongEvents]);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-[#0a0e1a] to-[#0f1419] rounded-2xl border border-[#124A59]/30 overflow-hidden text-white shadow-[0_20px_60px_rgba(18,74,89,0.4)] relative">
            {/* Header */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 bg-black/40 backdrop-blur-sm relative z-40">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Academic Calendar</h1>
                    <p className="text-gray-400 text-xs md:text-sm mt-1">Track your upcoming deadlines</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    {/* Toggle Filter Button - Hide on mobile */}
                    {!isMobileView && (
                        <button
                            onClick={() => setHideLongEvents(!hideLongEvents)}
                            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all border flex items-center gap-2 ${hideLongEvents
                                ? 'bg-[#00ff88] text-black border-[#00ff88]'
                                : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'
                                }`}
                            title="Hide tasks that are longer than the current view duration"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            {hideLongEvents ? 'Specific Only' : 'Show All'}
                        </button>
                    )}

                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-base md:text-lg font-semibold w-32 md:w-44 text-center text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    {/* View Mode Selector - Simplified on mobile */}
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowViewDropdown(!showViewDropdown); }}
                            className="px-3 md:px-4 py-2 text-xs md:text-sm bg-[#00ff88] hover:bg-[#00ff9d] text-black border border-[#00ff88] rounded-lg transition-all font-medium flex items-center gap-2">
                            {viewMode === 'today' && (isMobileView ? '📅' : '📅 Today')}
                            {viewMode === 'week' && (isMobileView ? '📆' : '📆 Week')}
                            {viewMode === 'month' && (isMobileView ? '🗓️' : '🗓️ Month')}
                            <svg className={`w-4 h-4 transition-transform ${showViewDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showViewDropdown && (
                            <div className="absolute top-full right-0 mt-2 bg-[#0d0d0d] backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[180px]">
                                {
                                    [{ value: 'today', label: 'Today', icon: '📅', desc: 'Tasks due today' },
                                    { value: 'week', label: 'Week', icon: '📆', desc: 'This week' },
                                    { value: 'month', label: 'Month', icon: '🗓️', desc: 'This month' }].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => { setViewMode(option.value); setShowViewDropdown(false); }}
                                            className={`w-full text-left px-4 py-3 transition-all flex items-start gap-3 ${viewMode === option.value
                                                ? 'bg-[#00ff88] text-black'
                                                : 'hover:bg-white/5 text-gray-300 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-xl">{option.icon}</span>
                                            <div>
                                                <div className="font-semibold text-sm">{option.label}</div>
                                                <div className="text-xs opacity-70">{option.desc}</div>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Day headers - Desktop only */}
            {!isMobileView && (
                <div className="grid grid-cols-7 border-b border-white/10 bg-black/20 relative z-10">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} className="py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{day.substring(0, 3)}</div>
                    ))}
                </div>
            )}

            {/* Show loading/placeholder on mobile until view is chosen */}
            {isMobileView && !hasChosenView ? (
                <div className="flex-1 flex items-center justify-center bg-black/30">
                    <div className="text-center">
                        <div className="text-6xl mb-4 animate-pulse">📅</div>
                        <p className="text-gray-400">Loading calendar...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Calendar Grid - Desktop Only */}
                    {!isMobileView ? (
                        <div className="flex-1 relative overflow-auto bg-black/30">
                            {/* Base calendar grid with date numbers */}
                            <div className="relative">
                                <div className="grid grid-cols-7">
                                    {days.map((date, index) => {
                                        if (!date) return <div key={`empty-${index}`} className="bg-black/20 border border-white/5" style={{ minHeight: '150px' }}></div>;

                                        const isToday = date.getDate() === new Date().getDate() &&
                                            date.getMonth() === new Date().getMonth() &&
                                            date.getFullYear() === new Date().getFullYear();

                                        // Check if this cell should be highlighted based on view mode
                                        const isInRange = isInViewRange(date);

                                        // Use precomputed events with rows
                                        const visibleEventsForDay = getVisibleEventsForDate(date, allEventsWithRows);
                                        const allEventsForDay = getEventsForDate(date); // For modal
                                        const hiddenCount = Math.max(0, allEventsForDay.length - visibleEventsForDay.length);

                                        return (
                                            <div
                                                key={date.toISOString()}
                                                className={`
                                            bg-white/5 hover:bg-white/8 transition-all relative border flex flex-col overflow-hidden
                                            ${isInRange
                                                        ? 'ring-2 ring-[#00ff9d] ring-inset shadow-[inset_0_0_20px_rgba(0,255,157,0.3)] border-[#00ff9d]/50'
                                                        : 'border-white/5'
                                                    }
                                        `}
                                                style={{ height: '150px' }}
                                            >
                                                {/* Date number - at top */}
                                                <div className="flex-shrink-0 pt-1 pl-1 z-10">
                                                    <span className={`text-sm font-bold px-2 py-1 rounded-full transition-all inline-block ${isToday
                                                        ? 'bg-gradient-to-r from-[#00f0ff] to-[#00ff9d] text-black shadow-lg shadow-[#00ff9d]/50'
                                                        : 'text-gray-400'
                                                        }`}>
                                                        {date.getDate()}
                                                    </span>
                                                </div>

                                                {/* Task zone - in the middle */}
                                                <div className="flex-1 flex flex-col justify-center px-1 py-1 gap-0.5 overflow-hidden">
                                                    {visibleEventsForDay.map((event, idx) => {
                                                        const isUrgent = isDueToday(event.dueDate);
                                                        return (
                                                            <div
                                                                key={`${event.id}-${idx}`}
                                                                onClick={() => handleEventClick(event)}
                                                                className={`
                                                            px-1.5 py-0.5 cursor-pointer transition-all duration-150 rounded
                                                            ${isUrgent
                                                                        ? 'bg-gradient-to-r from-red-600/90 to-orange-600/90 text-white border-l-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                                                                        : `${event.colors.bg} ${event.colors.text} ${event.colors.hover} border-l-2 ${event.colors.border}`
                                                                    }
                                                            backdrop-blur-sm shadow-sm hover:shadow-md
                                                            group overflow-hidden flex-shrink-0
                                                        `}
                                                                style={{ height: '20px' }}
                                                                title={`${event.courseFullName} (${event.courseName})\n${event.title} ${event.type === 'quiz' ? '📝' : '📄'}${isUrgent ? ' ⚠️ DUE TODAY!' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-0.5 h-full">
                                                                    {isUrgent && (
                                                                        <span className="text-[10px] font-black shrink-0 animate-bounce">⚠️</span>
                                                                    )}
                                                                    <span className="text-[9px] font-semibold truncate flex-1 leading-none">
                                                                        {event.courseName}{event.taskCount > 1 ? ` (${event.taskCount})` : ''}
                                                                    </span>
                                                                    <span className="text-[9px] opacity-60 shrink-0">
                                                                        {event.type === 'quiz' ? '📝' : '📄'}
                                                                    </span>
                                                                </div>
                                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* +N more indicator - at bottom */}
                                                {hiddenCount > 0 && (
                                                    <div
                                                        className="flex-shrink-0 pb-1 pl-1 z-10 cursor-pointer group"
                                                        onClick={(e) => { e.stopPropagation(); setShowMoreModal({ date, events: allEventsForDay }); }}
                                                    >
                                                        <div className={`inline-flex items-center px-2 py-1 bg-red-500/90 border border-red-600 rounded-md shadow-md hover:bg-red-600 hover:scale-105 transition-all duration-200 ${isToday ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}>
                                                            <svg className="w-3 h-3 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            <span className="text-[9px] font-bold text-white">+{hiddenCount} more</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Event overlay layer removed - tasks now render within each cell */}
                            </div>
                        </div>
                    ) : (
                        /* Mobile List View */
                        <div className="flex-1 overflow-auto bg-black/30 p-4">
                            {(() => {
                                // Group events by date for mobile view
                                const eventsByDate = new Map();

                                allEventsWithRows.forEach(event => {
                                    // Add event to each date in its range
                                    const start = new Date(event.startDate);
                                    const end = new Date(event.dueDate);

                                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                        const dateKey = d.toDateString();
                                        if (!eventsByDate.has(dateKey)) {
                                            eventsByDate.set(dateKey, []);
                                        }
                                        eventsByDate.get(dateKey).push(event);
                                    }
                                });

                                // Convert to sorted array
                                const sortedDates = Array.from(eventsByDate.entries())
                                    .sort((a, b) => new Date(a[0]) - new Date(b[0]));

                                if (sortedDates.length === 0) {
                                    return (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 text-lg mb-2">📅</div>
                                            <p className="text-gray-400">No upcoming tasks</p>
                                        </div>
                                    );
                                }

                                return sortedDates.map(([dateStr, events]) => {
                                    const date = new Date(dateStr);
                                    const isToday = date.getDate() === new Date().getDate() &&
                                        date.getMonth() === new Date().getMonth() &&
                                        date.getFullYear() === new Date().getFullYear();

                                    // Remove duplicates (same event appearing multiple times)
                                    const uniqueEvents = Array.from(new Map(events.map(e => [e.id, e])).values());

                                    return (
                                        <div key={dateStr} className="mb-6">
                                            {/* Date Header */}
                                            <div className={`sticky top-0 z-10 mb-3 pb-2 border-b ${isToday ? 'border-[#00ff9d]' : 'border-white/10'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`text-3xl font-bold ${isToday ? 'text-[#00ff9d]' : 'text-white'}`}>
                                                        {date.getDate()}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-semibold ${isToday ? 'text-[#00ff9d]' : 'text-white'}`}>
                                                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    {isToday && (
                                                        <span className="ml-auto px-3 py-1 bg-[#00ff9d] text-black text-xs font-bold rounded-full">
                                                            Today
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Events List */}
                                            <div className="space-y-2">
                                                {uniqueEvents.map(event => {
                                                    const isUrgent = isDueToday(event.dueDate);
                                                    const isDue = date.toDateString() === event.dueDate.toDateString();

                                                    return (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => handleEventClick(event)}
                                                            className={`
                                                        p-4 rounded-xl border-l-4 cursor-pointer transition-all
                                                        ${isUrgent
                                                                    ? 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500'
                                                                    : `${event.colors.bg.replace('/60', '/20')} ${event.colors.border}`
                                                                }
                                                        backdrop-blur-sm hover:scale-[1.02]
                                                    `}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {/* Icon */}
                                                                <div className={`p-2 rounded-lg shrink-0 ${isUrgent ? 'bg-red-500/30' : event.colors.bg.replace('/60', '/30')}`}>
                                                                    {event.type === 'quiz' ? (
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    )}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                                        <h3 className="text-white font-semibold text-sm leading-tight">
                                                                            {event.title}
                                                                            {event.taskCount > 1 && (
                                                                                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
                                                                                    {event.taskCount} tasks
                                                                                </span>
                                                                            )}
                                                                        </h3>
                                                                        {isUrgent && (
                                                                            <span className="text-lg shrink-0 animate-bounce">⚠️</span>
                                                                        )}
                                                                    </div>

                                                                    <p className={`text-xs mb-2 ${event.colors.text}`}>
                                                                        {event.courseName} — {event.courseFullName}
                                                                    </p>

                                                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                        {isDue && (
                                                                            <span className="flex items-center gap-1 text-red-400">
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                Due today
                                                                            </span>
                                                                        )}
                                                                        {event.duration > 1 && (
                                                                            <span className="flex items-center gap-1">
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                </svg>
                                                                                {event.duration} days
                                                                            </span>
                                                                        )}
                                                                        <span className="flex items-center gap-1">
                                                                            {event.type === 'quiz' ? '📝 Quiz' : '📄 Assignment'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </>
            )}


            {/* Welcome Modal - Mobile Only */}
            {showWelcomeModal && isMobileView && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#0a0e1a] to-[#0f1419] rounded-3xl shadow-2xl max-w-md w-full p-8 border border-[#00ff9d]/30 animate-scaleIn">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4 animate-bounce">📅</div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Calendar</h2>
                            <p className="text-gray-400 text-sm">Choose how you'd like to view your tasks</p>
                        </div>

                        {/* View Options */}
                        <div className="space-y-3 mb-6">
                            {/* Today Option */}
                            <button
                                onClick={() => handleViewSelection('today')}
                                className="w-full p-5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">📅</div>
                                    <div className="flex-1 text-left">
                                        <div className="text-white font-bold text-lg mb-1">Today</div>
                                        <div className="text-gray-400 text-xs">Focus on today's tasks only</div>
                                    </div>
                                    <svg className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Week Option */}
                            <button
                                onClick={() => handleViewSelection('week')}
                                className="w-full p-5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">📆</div>
                                    <div className="flex-1 text-left">
                                        <div className="text-white font-bold text-lg mb-1">This Week</div>
                                        <div className="text-gray-400 text-xs">View the next 7 days</div>
                                    </div>
                                    <svg className="w-6 h-6 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Month Option */}
                            <button
                                onClick={() => handleViewSelection('month')}
                                className="w-full p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">🗓️</div>
                                    <div className="flex-1 text-left">
                                        <div className="text-white font-bold text-lg mb-1">Full Calendar</div>
                                        <div className="text-gray-400 text-xs">See the entire month view</div>
                                    </div>
                                    <svg className="w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                💡 Tip: You can change this anytime using the view selector
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedEvent(null)}>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-gradient-to-br from-[#0d1a28]/98 to-[#0f2335]/98 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-[#5fd4e6]/30 animate-scaleIn relative" onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-2 rounded-lg ${selectedEvent.colors.bg} ${selectedEvent.colors.border} border-l-4`}>
                                    <span className={`text-sm font-bold uppercase tracking-wide ${selectedEvent.colors.text} flex items-center gap-2`}>
                                        {selectedEvent.taskCount > 1 ? `📋 ${selectedEvent.taskCount} TASKS` : (selectedEvent.type === 'quiz' ? '📝 QUIZ' : '📄 ASSIGNMENT')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Course Info */}
                            <p className={`text-sm mb-6 font-semibold ${selectedEvent.colors.text} flex items-center gap-2`}>
                                <span className="text-lg">📚</span>
                                {selectedEvent.courseName} — {selectedEvent.courseFullName}
                            </p>

                            {/* Show grouped tasks list if multiple tasks */}
                            {selectedEvent.taskCount > 1 ? (
                                <div className="space-y-3 mb-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Tasks in this group:</p>
                                    {selectedEvent.groupedTasks.map((task, idx) => (
                                        <div key={task.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-base font-bold text-white flex-1">{idx + 1}. {task.title}</h4>
                                                <span className="text-xs px-2 py-1 rounded bg-white/10">{task.type === 'quiz' ? '📝 Quiz' : '📄 Assignment'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Due: {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <a
                                                href={task.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-block text-xs px-3 py-1.5 bg-[#5fd4e6]/20 text-[#5fd4e6] rounded hover:bg-[#5fd4e6]/30 transition-all border border-[#5fd4e6]/30"
                                            >
                                                Open in LMS
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* Single task - show title and details */}
                                    <h3 className="text-2xl font-bold text-white mb-6">{selectedEvent.title}</h3>

                                    {/* Details */}
                                    <div className="space-y-3 mb-8">
                                        {selectedEvent.startDate && (
                                            <div className="py-3 px-4 bg-white/5 rounded-xl border border-emerald-500/20 flex items-center gap-3 hover:bg-white/10 transition-all">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-emerald-400 uppercase font-bold">Start Date</div>
                                                    <div className="text-gray-200 text-sm font-medium">
                                                        {selectedEvent.startDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="py-3 px-4 bg-white/5 rounded-xl border border-red-500/20 flex items-center gap-3 hover:bg-white/10 transition-all">
                                            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs text-red-400 uppercase font-bold">Due Date</div>
                                                <div className="text-gray-200 text-sm font-medium">
                                                    {selectedEvent.dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-3 px-4 bg-white/5 rounded-xl border border-blue-500/20 flex items-center gap-3 hover:bg-white/10 transition-all">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs text-blue-400 uppercase font-bold">Duration</div>
                                                <div className="text-gray-200 text-sm font-medium">{selectedEvent.duration} day{selectedEvent.duration > 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Actions - only show for single tasks */}
                            {selectedEvent.taskCount <= 1 && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (onNavigateToCourse && selectedEvent.courseId) {
                                                onNavigateToCourse(selectedEvent.courseId, selectedEvent.id);
                                            }
                                            setSelectedEvent(null);
                                        }}
                                        className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#08262C] to-[#124A59] hover:from-[#124A59] hover:to-[#1a6b7f] text-white font-bold rounded-xl shadow-[0_8px_30px_rgba(18,74,89,0.5)] hover:shadow-[0_12px_40px_rgba(26,107,127,0.7)] transition-all duration-300 border border-[#5fd4e6]/30 flex items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        View in Course
                                    </button>
                                    <a
                                        href={selectedEvent.externalLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center justify-center gap-2 hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open LMS
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Show More Modal - shows all events for a specific date */}
            {showMoreModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowMoreModal(null)}>
                    <div className="bg-gradient-to-br from-[#0d1a28]/98 to-[#0f2335]/98 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-[#5fd4e6]/30 animate-scaleIn max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Events on {showMoreModal.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">{showMoreModal.events.length} event{showMoreModal.events.length > 1 ? 's' : ''} total</p>
                            </div>
                            <button
                                onClick={() => setShowMoreModal(null)}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Events list */}
                        <div className="space-y-3">
                            {showMoreModal.events.map((event, idx) => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${event.colors.bg} ${event.colors.border} border-l-4 hover:scale-[1.02]`}
                                    onClick={() => { setShowMoreModal(null); setSelectedEvent(event); }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className={`text-base font-bold ${event.colors.text} flex items-center gap-2`}>
                                                <span>{event.courseName}</span>
                                                {event.taskCount > 1 && <span className="text-xs px-1.5 py-0.5 rounded bg-white/20">({event.taskCount})</span>}
                                            </h4>
                                            <p className="text-sm text-white/90 mt-1">{event.taskCount > 1 ? `${event.taskCount} tasks` : event.title}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded bg-white/20 text-white">
                                            {event.type === 'quiz' ? '📝 Quiz' : '📄 Assignment'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/70">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Due: {event.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Loading Component - Modern Educational System Style
const LoadingScreen = ({ message = "Loading your data..." }) => {
    const [progress, setProgress] = React.useState(0);
    const [loadingStage, setLoadingStage] = React.useState('Connecting to server...');

    React.useEffect(() => {
        const stages = [
            'Connecting to server...',
            'Authenticating...',
            'Fetching courses...',
            'Loading assignments...',
            'Almost ready...'
        ];

        let currentStage = 0;
        let currentProgress = 0;

        const progressInterval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress > 100) currentProgress = 100;
            setProgress(currentProgress);

            // Update stage based on progress
            const stageIndex = Math.floor((currentProgress / 100) * stages.length);
            if (stageIndex < stages.length && stageIndex !== currentStage) {
                currentStage = stageIndex;
                setLoadingStage(stages[stageIndex]);
            }

            if (currentProgress >= 100) {
                clearInterval(progressInterval);
            }
        }, 300);

        return () => clearInterval(progressInterval);
    }, []);

    return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)',
                    animation: 'pulse 4s ease-in-out infinite'
                }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-8">
                {/* Logo Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-2xl mb-6 shadow-2xl shadow-[#00ff88]/20">
                        <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-2xl font-black text-white">P</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">PSU Learning System</h2>
                    <p className="text-gray-400 text-sm">Prince of Songkla University</p>
                </div>

                {/* Progress Section */}
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-300">{loadingStage}</span>
                            <span className="text-sm font-bold text-[#00ff88]">{Math.round(progress)}%</span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Items Skeleton */}
                    <div className="space-y-3 mt-8">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Loading Content</div>
                        {[1, 2, 3].map((item, index) => (
                            <div
                                key={item}
                                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 animate-pulse"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Icon Skeleton */}
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-lg"></div>

                                    {/* Text Skeleton */}
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-white/10 rounded w-3/4"></div>
                                        <div className="h-2 bg-white/5 rounded w-1/2"></div>
                                    </div>

                                    {/* Loading Indicator */}
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Text */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-gray-500">
                            Secure connection • Encrypted data transfer
                        </p>
                    </div>
                </div>
            </div>

            {/* Add shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

// Main LMS Application Component
const LMSApp = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [view, setView] = useState('dashboard');
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [highlightedId, setHighlightedId] = useState(null);
    const [courseContents, setCourseContents] = useState({});
    const [token, setToken] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Apply theme changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // Moodle API Configuration
    const LMS_BASE_URL = '/lms-proxy'; // For API calls (through proxy)
    const LMS_EXTERNAL_URL = 'https://lms.psu.ac.th'; // For external links (direct)
    const MOODLE_SERVICE = 'moodle_mobile_app';

    const handleLogin = async (username, password) => {
        setIsLoading(true);
        setError(null);

        // Direct demo access cheat code
        if (username === 'demo' && password === 'demo') {
            setTimeout(() => {
                setIsDemoMode(true);
                setCourses(mockCourses);
                setAssignments(mockAssignments);
                setIsLoggedIn(true);
                setView('dashboard');
                setIsLoading(false);
            }, 800);
            return;
        }

        try {
            // Step 1: Get Token using POST with form data (Moodle standard)
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('service', 'moodle_mobile_app');

            const tokenRes = await fetch(`${LMS_BASE_URL}/login/token.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const tokenData = await tokenRes.json();

            // Handle errors from token endpoint
            if (tokenData.error) {
                console.warn("Token Error:", tokenData.error);
                setError('Invalid username or password');
                setIsLoading(false);
                return;
            }

            // Only proceed if we have a token
            if (!tokenData.token) {
                setError('Unexpected response from server');
                setIsLoading(false);
                return;
            }

            const token = tokenData.token;
            setToken(token);

            // Step 2: Get Site Info (User ID) - Verify token is valid
            const siteInfoRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`);
            const siteInfo = await siteInfoRes.json();

            if (siteInfo.exception || siteInfo.errorcode) {
                setError('Authentication successful but failed to retrieve user info.');
                setIsLoading(false);
                return;
            }

            const userId = siteInfo.userid;

            // Step 3: Get Enrolled Courses
            const coursesRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_enrol_get_users_courses&userid=${userId}&moodlewsrestformat=json`);
            const coursesData = await coursesRes.json();
            if (Array.isArray(coursesData)) {
                // Map courses to our format
                const mappedCourses = coursesData.map(c => ({
                    id: c.id,
                    code: c.shortname,
                    name: c.fullname,
                    description: c.summary || 'No description available.',
                    instructor: 'University Instructor', // API doesn't always provide this easily
                    color: 'from-blue-600 to-cyan-400'
                }));

                setCourses(mappedCourses);
                // Mark as logged in ONLY after successful data fetch
                setIsLoggedIn(true);
                setIsDemoMode(false); // Ensure demo mode is OFF

                // Step 4: Fetch Assignments & Quizzes for all courses (Background)
                // Fetch assignments & quizzes in PARALLEL for better performance
                const fetchPromises = mappedCourses.map(async (course) => {
                    const courseAssignments = [];

                    try {
                        // Fetch assignments and quizzes in parallel for this course
                        const [assignData, quizData] = await Promise.all([
                            fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=mod_assign_get_assignments&courseids[]=${course.id}&moodlewsrestformat=json`)
                                .then(r => r.json()),
                            fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=mod_quiz_get_quizzes_by_courses&courseids[]=${course.id}&moodlewsrestformat=json`)
                                .then(r => r.json())
                        ]);

                        // Process assignments
                        if (assignData.courses && assignData.courses.length > 0) {
                            const courseAssigns = assignData.courses[0].assignments;
                            if (courseAssigns) {
                                courseAssigns.forEach(a => {
                                    if (a.duedate) {
                                        courseAssignments.push({
                                            id: `assign-${a.id}`,
                                            courseId: course.id,
                                            title: a.name,
                                            name: a.name,
                                            description: a.intro || '',
                                            dueDate: new Date(a.duedate * 1000).toISOString(),
                                            startDate: a.allowsubmissionsfromdate ? new Date(a.allowsubmissionsfromdate * 1000).toISOString() : null,
                                            duedate: a.duedate,
                                            type: 'assignment',
                                            externalLink: `${LMS_EXTERNAL_URL}/mod/assign/view.php?id=${a.cmid}`
                                        });
                                    }
                                });
                            }
                        }

                        // Process quizzes
                        if (quizData.quizzes && Array.isArray(quizData.quizzes)) {
                            quizData.quizzes.forEach(quiz => {
                                if (quiz.timeclose > 0) {
                                    courseAssignments.push({
                                        id: `quiz-${quiz.id}`,
                                        courseId: quiz.course,
                                        title: quiz.name,
                                        name: quiz.name,
                                        description: quiz.intro || '',
                                        dueDate: new Date(quiz.timeclose * 1000).toISOString(),
                                        startDate: quiz.timeopen ? new Date(quiz.timeopen * 1000).toISOString() : null,
                                        duedate: quiz.timeclose,
                                        type: 'quiz',
                                        externalLink: `${LMS_EXTERNAL_URL}/mod/quiz/view.php?id=${quiz.coursemodule || quiz.id}`
                                    });
                                }
                            });
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch tasks for course ${course.id}:`, err);
                    }

                    return courseAssignments;
                });

                // Wait for all courses to complete and flatten results
                const allCoursesAssignments = await Promise.all(fetchPromises);
                const allAssignments = allCoursesAssignments.flat();

                // Remove duplicates (if any)
                const uniqueAssignments = Array.from(
                    new Map(allAssignments.map(item => [item.id, item])).values()
                );


                console.log(`✅ Loaded ${uniqueAssignments.length} total assignments/quizzes for Calendar`);
                setAssignments(uniqueAssignments);
            } else {
                // Even if no courses found, we are logged in, just empty
                setCourses([]);
                setIsLoggedIn(true);
                setIsDemoMode(false);
            }

            setView('dashboard');
            setIsLoading(false);

        } catch (err) {
            console.error("Login Error:", err);
            // DO NOT enter demo mode on error anymore
            setError('Connection failed. Please check your internet or credentials.');
            setIsLoading(false);
        }
    };

    const fetchDashboardData = async (activeToken) => {
        try {
            const siteInfoRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${activeToken}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`);
            const siteInfo = await siteInfoRes.json();

            if (siteInfo.userid) {
                const coursesRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${activeToken}&wsfunction=core_enrol_get_users_courses&userid=${siteInfo.userid}&moodlewsrestformat=json`);
                const coursesData = await coursesRes.json();

                if (Array.isArray(coursesData)) {
                    const mappedCourses = coursesData.map(c => ({
                        id: c.id,
                        code: c.shortname,
                        name: c.fullname,
                        description: c.summary,
                        ...c
                    }));
                    setCourses(mappedCourses);

                    // Fetch calendar events
                    const now = Math.floor(Date.now() / 1000);
                    const timeFrom = now - (30 * 24 * 60 * 60);

                    const eventsRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${activeToken}&wsfunction=core_calendar_get_action_events_by_timesort&timesortfrom=${timeFrom}&limitnum=100&moodlewsrestformat=json`);
                    const eventsData = await eventsRes.json();

                    let allAssignments = [];

                    if (eventsData.events) {
                        allAssignments = eventsData.events.map(e => ({
                            id: `evt-${e.id}`,
                            courseId: e.course ? e.course.id : 0,
                            title: e.name,
                            description: e.description || 'No description available.',
                            dueDate: new Date(e.timesort * 1000).toISOString(),
                            startDate: e.timestart ? new Date(e.timestart * 1000).toISOString() : null,
                            type: e.modulename || 'event',
                            externalLink: e.viewurl || e.url
                        }));
                    }

                    // ðŸŽ¯ NEW: Fetch assignments and quizzes from ALL courses for complete Calendar data
                    console.log('Fetching assignments from all courses...');
                    const courseIds = mappedCourses.map(c => c.id);

                    // Fetch all assignments
                    try {
                        const assignParams = courseIds.map((id, i) => `courseids[${i}]=${id}`).join('&');
                        const assignRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${activeToken}&wsfunction=mod_assign_get_assignments&${assignParams}&moodlewsrestformat=json`);
                        const assignData = await assignRes.json();

                        if (assignData.courses && Array.isArray(assignData.courses)) {
                            assignData.courses.forEach(course => {
                                if (course.assignments && Array.isArray(course.assignments)) {
                                    course.assignments.forEach(assign => {
                                        if (assign.duedate && assign.duedate > 0) {
                                            const newAssignment = {
                                                id: `assign-${assign.id}`,
                                                courseId: course.id,
                                                title: assign.name,
                                                name: assign.name,
                                                description: assign.intro || 'No description available.',
                                                dueDate: new Date(assign.duedate * 1000).toISOString(),
                                                startDate: assign.allowsubmissionsfromdate ? new Date(assign.allowsubmissionsfromdate * 1000).toISOString() : null,
                                                duedate: assign.duedate,
                                                type: 'assign',
                                                externalLink: `${LMS_EXTERNAL_URL}/mod/assign/view.php?id=${assign.cmid || assign.id}`
                                            };

                                            // Add if not already in allAssignments
                                            if (!allAssignments.some(a => a.id === newAssignment.id)) {
                                                allAssignments.push(newAssignment);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    } catch (err) {
                        console.warn('Failed to fetch assignments:', err);
                    }

                    // Fetch all quizzes
                    try {
                        const quizParams = courseIds.map((id, i) => `courseids[${i}]=${id}`).join('&');
                        const quizRes = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${activeToken}&wsfunction=mod_quiz_get_quizzes_by_courses&${quizParams}&moodlewsrestformat=json`);
                        const quizData = await quizRes.json();

                        if (quizData.quizzes && Array.isArray(quizData.quizzes)) {
                            quizData.quizzes.forEach(quiz => {
                                if (quiz.timeclose && quiz.timeclose > 0) {
                                    const newQuiz = {
                                        id: `quiz-${quiz.id}`,
                                        courseId: quiz.course,
                                        title: quiz.name,
                                        name: quiz.name,
                                        description: quiz.intro || 'No description available.',
                                        dueDate: new Date(quiz.timeclose * 1000).toISOString(),
                                        startDate: quiz.timeopen ? new Date(quiz.timeopen * 1000).toISOString() : null,
                                        duedate: quiz.timeclose,
                                        type: 'quiz',
                                        externalLink: `${LMS_EXTERNAL_URL}/mod/quiz/view.php?id=${quiz.coursemodule || quiz.id}`
                                    };

                                    // Add if not already in allAssignments  
                                    if (!allAssignments.some(a => a.id === newQuiz.id)) {
                                        allAssignments.push(newQuiz);
                                    }
                                }
                            });
                        }
                    } catch (err) {
                        console.warn('Failed to fetch quizzes:', err);
                    }

                    console.log(`âœ… Loaded ${allAssignments.length} total assignments/quizzes for Calendar`);
                    setAssignments(allAssignments);
                }
            }
            setView('dashboard');
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching data", err);
            setIsDemoMode(true);
            setCourses(mockCourses);
            setAssignments(mockAssignments);
            setView('dashboard');
            setIsLoading(false);
        }
    };

    const fetchCourseContents = async (courseId) => {
        if (isDemoMode) return;
        if (courseContents[courseId]) return;

        try {
            const res = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=core_course_get_contents&courseid=${courseId}&moodlewsrestformat=json`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCourseContents(prev => ({ ...prev, [courseId]: data }));

                const extractedTasks = [];
                data.forEach(section => {
                    if (section.modules && Array.isArray(section.modules)) {
                        section.modules.forEach(mod => {
                            if (mod.modname === 'assign' || mod.modname === 'quiz') {
                                extractModuleDetails(courseId, mod);
                            }
                        });
                    }
                });
            }
        } catch (err) {
            console.error("Failed to fetch course contents:", err);
        }
    };

    const extractModuleDetails = async (courseId, mod) => {
        try {
            if (mod.modname === 'assign') {
                const res = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=mod_assign_get_assignments&courseids[]=${courseId}&moodlewsrestformat=json`);
                const data = await res.json();

                if (data.courses && data.courses.length > 0) {
                    const course = data.courses.find(c => c.id === courseId);
                    if (course && course.assignments) {
                        const assignment = course.assignments.find(a => a.name === mod.name);
                        if (assignment) {
                            const newAssignment = {
                                id: `assign-${assignment.id}`,
                                courseId: courseId,
                                title: assignment.name,
                                name: assignment.name,
                                description: assignment.intro || 'No description available.',
                                dueDate: assignment.duedate ? new Date(assignment.duedate * 1000).toISOString() : null,
                                startDate: assignment.allowsubmissionsfromdate ? new Date(assignment.allowsubmissionsfromdate * 1000).toISOString() : null,
                                duedate: assignment.duedate,
                                type: 'assign',
                                externalLink: mod.url
                            };

                            if (newAssignment.dueDate) {
                                setAssignments(prev => {
                                    const exists = prev.some(a => a.id === newAssignment.id);
                                    if (!exists) {
                                        return [...prev, newAssignment];
                                    }
                                    return prev;
                                });
                            }
                        }
                    }
                }
            } else if (mod.modname === 'quiz') {
                const res = await fetch(`${LMS_BASE_URL}/webservice/rest/server.php?wstoken=${token}&wsfunction=mod_quiz_get_quizzes_by_courses&courseids[]=${courseId}&moodlewsrestformat=json`);
                const data = await res.json();

                if (data.quizzes && Array.isArray(data.quizzes)) {
                    const quiz = data.quizzes.find(q => q.name === mod.name);
                    if (quiz) {
                        const newQuiz = {
                            id: `quiz-${quiz.id}`,
                            courseId: courseId,
                            title: quiz.name,
                            name: quiz.name,
                            description: quiz.intro || 'No description available.',
                            dueDate: quiz.timeclose ? new Date(quiz.timeclose * 1000).toISOString() : null,
                            startDate: quiz.timeopen ? new Date(quiz.timeopen * 1000).toISOString() : null,
                            duedate: quiz.timeclose,
                            type: 'quiz',
                            externalLink: mod.url
                        };

                        if (newQuiz.dueDate) {
                            setAssignments(prev => {
                                const exists = prev.some(a => a.id === newQuiz.id);
                                if (!exists) {
                                    return [...prev, newQuiz];
                                }
                                return prev;
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error(`Failed to fetch details for ${mod.modname}:`, err);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsDemoMode(false);
        setToken(null);
        setCourseContents({});
        setHighlightedId(null);
        setView('dashboard');
        setCurrentCourseId(null);
        setIsLoading(false); // Reset loading state
        setError(null);      // Clear any errors
    };

    const handleNavigateToCourse = (courseId, taskId = null) => {
        setCurrentCourseId(courseId);
        setHighlightedId(taskId);
        setView('course');
        if (!isDemoMode && token) {
            fetchCourseContents(courseId);
        }
    };

    const handleNavigateDashboard = () => {
        setView('dashboard');
        setCurrentCourseId(null);
    };

    const handleNavigateCalendar = () => {
        setView('calendar');
    };

    // Show loading screen if logged in but still loading data
    if (isLoggedIn && isLoading) {
        return <LoadingScreen message="Fetching your courses..." />;
    }

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center h-full relative overflow-hidden rounded-2xl bg-black">
                {/* Elegant dark background with subtle pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#000000]"></div>
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0, 255, 157, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 240, 255, 0.03) 0%, transparent 50%)'
                }}></div>

                {/* Clean, minimal login card */}
                <div className="bg-[#0d0d0d] backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/10 relative z-10 mx-4">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="w-14 h-14 bg-[#00ff88] rounded-xl flex items-center justify-center text-black font-black text-2xl mx-auto mb-5">
                            P
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">PSU Learning System</h2>
                        <p className="text-gray-400 text-sm">Prince of Songkla University</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.username.value, e.target.password.value); }} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Student ID / Username</label>
                            <input
                                type="text"
                                name="username"
                                className="w-full px-4 py-3 rounded-lg border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all text-white bg-black/40 placeholder-gray-600"
                                placeholder="6810xxxxx"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="w-full px-4 py-3 pr-12 rounded-lg border border-white/10 focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] outline-none transition-all text-white bg-black/40 placeholder-gray-600"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00ff88] transition-colors focus:outline-none"
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        // Eye Slash Icon (Hide)
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        // Eye Icon (Show)
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

                        {/* Sign In Button - Clean green solid */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 rounded-lg font-semibold text-black transition-all transform active:scale-98 ${isLoading
                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-[#00ff88] hover:bg-[#00ff9d] shadow-lg shadow-[#00ff88]/20'
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer Info */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-500">
                            Secure connection via Moodle API
                            <br />
                            <span className="text-gray-600">Demo mode available for testing</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lms-container bg-black text-white h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10 relative">
            {/* Simple clean background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#000000] to-[#0a0a0a] pointer-events-none"></div>

            {/* Clean header - responsive */}
            <header className="bg-black border-b border-white/10 px-3 md:px-5 py-3 flex justify-between items-center sticky top-0 z-20 shrink-0 h-14 relative">
                {/* macOS buttons - desktop only */}
                <div className="hidden md:flex items-center gap-4 w-1/3">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                    </div>
                </div>

                {/* Center logo */}
                <div className="flex justify-center md:w-1/3">
                    <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-lg border border-white/10 bg-black/50">
                        <div className="w-5 h-5 bg-[#00ff88] rounded flex items-center justify-center text-black font-bold text-xs">P</div>
                        <span className="font-bold text-sm tracking-wide text-white">PSU LMS</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-end md:w-1/3">
                    <nav className="flex items-center gap-1 md:gap-2">
                        <button
                            onClick={handleNavigateDashboard}
                            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${view === 'dashboard'
                                ? 'bg-[#00ff88] text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={handleNavigateCalendar}
                            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${view === 'calendar'
                                ? 'bg-[#00ff88] text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            {isDemoMode && (
                <div className="bg-gold-500/10 border-b border-gold-500/20 px-6 py-1.5 text-xs text-gold-400 flex items-center justify-center backdrop-blur relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mr-2 animate-pulse"></span>
                    <span className="font-bold mr-1">DEMO ACCESS:</span> Simulated environment active.
                </div>
            )}

            <div className="p-0 overflow-y-auto flex-1 relative z-10 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent">
                <div className="p-6 min-h-full">
                    {view === 'dashboard' && <Dashboard courses={courses} onCourseSelect={handleNavigateToCourse} />}
                    {view === 'course' && currentCourseId && <CourseDetails
                        courses={courses}
                        assignments={assignments}
                        contents={courseContents[currentCourseId]}
                        courseId={currentCourseId}
                        highlightedId={highlightedId}
                        onBack={handleNavigateDashboard}
                    />}
                    {view === 'calendar' && <Calendar courses={courses} assignments={assignments} onNavigateToCourse={handleNavigateToCourse} />}
                </div>
            </div>
        </div>
    );
};

export default LMSApp;
