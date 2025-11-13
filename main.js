document.addEventListener("DOMContentLoaded", () => {
  (() => {
    const categories = document.querySelectorAll(".category-btn");
    const questions = document.querySelectorAll(".question-item");
    const categoriesContainer = document.querySelector(".categories-collection");
    const answerBox = document.querySelector(".qa-answer");
    const qaBody = answerBox?.querySelector(".qa-body");
    const qaBodyContainer = qaBody?.parentElement;
    const input = document.querySelector(".predictive-search");
    const intentInput = document.getElementById("intent");
    const statusLine = document.querySelector(".search-status");
    const loadingEl = document.querySelector(".loading2");
    const ctaGlobal = document.querySelector(".chat-disclaimer-and-cta");
    const modalCloseBtn = document.querySelector(".modal-close");
    const globalResetBtn = document.querySelector(".global-reset");
    const iconReload = document.querySelector(".modal-icon-reload");
    const iconClose = document.querySelector(".modal-icon-close");
    const suggestedQuestions = document.querySelector(".suggested-questions");


    if (questions.length === 0) return;

    let firstAnswerShown = false;
    let isProgrammaticChange = false;
    let isConversationStarted = false;
    let isCategoryActive = false;
    let isTypingActive = false;

    if (statusLine) statusLine.style.opacity = "0";
    if (loadingEl) loadingEl.style.opacity = "0";
    if (answerBox) {
      answerBox.style.opacity = "0";
      answerBox.style.transition = "none";
      answerBox.classList.remove("is-active");
    }
    if (ctaGlobal) {
      Object.assign(ctaGlobal.style, {
        opacity: "0",
        pointerEvents: "none",
        height: "0",
        paddingTop: "0",
        paddingBottom: "0",
        overflow: "hidden",
        transition: "none",
      });
    }
    
    if (modalCloseBtn) modalCloseBtn.style.display = "none";
    if (iconReload) iconReload.style.display = "none";
    if (globalResetBtn) {
      globalResetBtn.style.display = "none";
      globalResetBtn.style.opacity = "0";
      globalResetBtn.style.pointerEvents = "none";
    }

    questions.forEach((item) => {
      Object.assign(item.style, {
        display: "none",
        visibility: "hidden",
        opacity: "0",
      });
    });

    const defaultPlaceholder = "Ask any workforce-related question, or select one of the quick-start examples below.";
    if (input) input.placeholder = defaultPlaceholder;

    function autoResizeTextarea(textarea) {
      if (!textarea) return;
      const isMobile = window.innerWidth <= 479;
      if (!isMobile) {
        textarea.style.setProperty("height", "auto", "important");
        textarea.style.setProperty("min-height", "auto", "important");
        textarea.style.setProperty("max-height", "none", "important");
        return;
      }
      
      textarea.style.setProperty("min-height", "auto", "important");
      textarea.style.setProperty("max-height", "none", "important");
      textarea.style.setProperty("height", "auto", "important");
      
      const parent = textarea.parentElement;
      if (parent) {
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.maxHeight && computedStyle.maxHeight !== "none") {
          parent.style.setProperty("max-height", "none", "important");
        }
        if (computedStyle.height && computedStyle.height !== "auto") {
          parent.style.setProperty("height", "auto", "important");
        }
      }
      
      void textarea.offsetHeight;
      
      const computed = window.getComputedStyle(textarea);
      const currentMaxHeight = computed.maxHeight;
      const currentHeight = computed.height;
      
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > 0) {
        textarea.style.setProperty("height", scrollHeight + "px", "important");
        
        console.log("📱 Mobile auto-resize:", {
          scrollHeight,
          currentHeight,
          currentMaxHeight,
          newHeight: scrollHeight + "px"
        });
      }
    }
    
    function checkAndFixRichMediaOverlap(richMediaContainer) {
      if (!richMediaContainer) return;
      
      const personWrap = richMediaContainer.querySelector(".rm-person-wrap");
      const skillCont = richMediaContainer.querySelector(".rm-skill-cont");
      
      if (!personWrap || !skillCont) return;
      
      const isMobile = window.innerWidth <= 479;
      const isTablet = window.innerWidth <= 767;
      
      richMediaContainer.style.setProperty("display", "flex", "important");
      richMediaContainer.style.setProperty("flex-direction", "row", "important");
      richMediaContainer.style.setProperty("gap", "1rem", "important");
      
      if (isMobile) {
        richMediaContainer.style.setProperty("width", "100%", "important");
      } else {
        richMediaContainer.style.setProperty("width", "auto", "important");
      }
      
      void richMediaContainer.offsetHeight;
      
      const containerRect = richMediaContainer.getBoundingClientRect();
      const personRect = personWrap.getBoundingClientRect();
      const skillContRect = skillCont.getBoundingClientRect();
      
      const gap = 16;
      const totalWidthNeeded = personRect.width + skillContRect.width + gap;
      const containerWidth = containerRect.width;
      
      const personWrapTooWide = totalWidthNeeded > containerWidth;
      
      const overlaps = !(
        personRect.right <= skillContRect.left ||
        personRect.left >= skillContRect.right
      );
      
      if (personWrapTooWide || overlaps) {
        richMediaContainer.style.setProperty("flex-direction", "column", "important");
        if (isMobile) {
          richMediaContainer.style.setProperty("width", "100%", "important");
        } else {
          richMediaContainer.style.setProperty("width", "auto", "important");
        }
        richMediaContainer.style.setProperty("gap", "1rem", "important");
      } else {
        richMediaContainer.style.setProperty("flex-direction", "row", "important");
        if (isMobile) {
          richMediaContainer.style.setProperty("width", "100%", "important");
        } else {
          richMediaContainer.style.setProperty("width", "auto", "important");
        }
        richMediaContainer.style.setProperty("gap", "1rem", "important");
      }
      
      const rmSkill = skillCont.querySelector(".rm-skill");
      const matchWrap = skillCont.querySelector(".rm-match-wrap");
      
      if (rmSkill && matchWrap) {
        if (!isTablet) {
          skillCont.style.setProperty("display", "flex", "important");
          skillCont.style.setProperty("flex-direction", "row", "important");
        }
      }
    }
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (input && input.value) autoResizeTextarea(input);
        if (intentInput && intentInput.value) autoResizeTextarea(intentInput);
      });
    });

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (input) autoResizeTextarea(input);
        if (intentInput) autoResizeTextarea(intentInput);
        
        const richMediaContainers = document.querySelectorAll(".rich-media-answer");
        richMediaContainers.forEach(container => {
          checkAndFixRichMediaOverlap(container);
        });
      }, 100);
    });

    let submitBtn = document.getElementById("chat-submit");
    if (!submitBtn) {
      submitBtn = document.createElement("button");
      submitBtn.id = "chat-submit";
      submitBtn.textContent = "Ask Everday";
      submitBtn.type = "button";
      submitBtn.disabled = true;
      submitBtn.className = "chat-send";
      Object.assign(submitBtn.style, {
        display: "none",
        opacity: "0",
        transition: "opacity 0.25s ease-in-out",
      });
      const targetWrap = document.querySelector(".submit-button-wrap");
      if (targetWrap) targetWrap.appendChild(submitBtn);
    }

    const answersWrap = document.querySelector(".answers-suggestions-wrap");
    let hintEl = document.querySelector(".hint-text");
    if (!hintEl && answersWrap) {
      hintEl = document.createElement("p");
      hintEl.className = "hint-text";
      Object.assign(hintEl.style, {
        opacity: "0",
        transition: "none",
      });
      answersWrap.insertBefore(hintEl, answersWrap.firstChild);
    }

    function updateSuggestedQuestionsClass() {
      if (!suggestedQuestions) return;
      const hasVisibleQuestions = Array.from(questions).some((item) => {
        const style = window.getComputedStyle(item);
        return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      });
      if (hasVisibleQuestions) {
        suggestedQuestions.classList.add("is-open");
      } else {
        suggestedQuestions.classList.remove("is-open");
      }
    }

    function filterQuestionsByKeyword(keyword) {
      if (!keyword || keyword.length < 3) {
        resetToDefaultView();
        return 0;
      }
      const lowerKeyword = keyword.toLowerCase().trim();
      let matchCount = 0;
      if (categoriesContainer) categoriesContainer.style.display = "none";
      
      // Reset suggested questions container styles to ensure it's visible
      if (suggestedQuestions) {
        suggestedQuestions.style.height = "auto";
        suggestedQuestions.style.paddingTop = "";
        suggestedQuestions.style.paddingBottom = "";
        suggestedQuestions.style.marginTop = "";
        suggestedQuestions.style.overflow = "";
        suggestedQuestions.style.opacity = "1";
      }
      
      questions.forEach((item) => {
        const qText = item.querySelector(".question-text")?.textContent.trim() || "";
        const matches = qText.toLowerCase().includes(lowerKeyword);
        if (matches) {
          Object.assign(item.style, { display: "block", visibility: "visible", opacity: "1" });
          matchCount++;
        } else {
          Object.assign(item.style, { display: "none", visibility: "hidden", opacity: "0" });
        }
      });
      if (hintEl) {
        if (matchCount === 0) {
          hintEl.textContent = "Sign up and Everday will answer all of your questions.";
        } else {
          hintEl.textContent = "Pick one of the matching questions below.";
        }
        hintEl.style.opacity = "1";
      }
      updateSuggestedQuestionsClass();
      return matchCount;
    }

    function resetToDefaultView() {
      if (categoriesContainer) categoriesContainer.style.display = "flex";
      if (!isCategoryActive) {
        questions.forEach((item) => {
          Object.assign(item.style, {
            display: "none",
            visibility: "hidden",
            opacity: "0",
          });
        });
      }
      if (hintEl) {
        hintEl.textContent = "";
        hintEl.style.opacity = "0";
      }
      updateSuggestedQuestionsClass();
    }

    function resetTextAreas() {
      if (input) {
        input.value = "";
        input.placeholder = defaultPlaceholder;
        input.classList.remove("conversation-started");
        input.readOnly = false;
        // Reset styles
        gsap.to(input, {
          margin: "",
          padding: "",
          width: "",
          borderRadius: "",
          backgroundColor: "",
          border: "",
          duration: 0.3,
          ease: "power2.out"
        });
      }
      if (intentInput) {
        intentInput.value = "";
        intentInput.classList.remove("conversation-started");
        intentInput.readOnly = false;
        intentInput.style.width = "auto";
        // Reset styles
        gsap.to(intentInput, {
          margin: "",
          padding: "",
          width: "auto",
          borderRadius: "",
          backgroundColor: "",
          border: "",
          duration: 0.3,
          ease: "power2.out"
        });
      }
      if (qaBody) {
        qaBody.innerHTML = "";
        qaBody.style.opacity = "0";
        qaBody.style.display = "none";
      }
      
      if (input) {
        input.style.setProperty("height", "auto", "important");
        autoResizeTextarea(input);
      }
      if (intentInput) {
        intentInput.style.setProperty("height", "auto", "important");
        autoResizeTextarea(intentInput);
      }
      if (qaBodyContainer) {
        const apiThink = qaBodyContainer.querySelector(".api-think");
        if (apiThink) apiThink.remove();
      }
      if (qaBody) {
        const rmWrap = qaBody.querySelector(".rm-wrap");
        if (rmWrap) rmWrap.remove();
      }
      if (answerBox) {
        answerBox.style.opacity = "0";
        answerBox.classList.remove("is-active");
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0";
        setTimeout(() => (submitBtn.style.display = "none"), 200);
      }
      if (hintEl) {
        hintEl.textContent = "";
        hintEl.style.opacity = "0";
      }
      if (globalResetBtn) {
        globalResetBtn.style.opacity = "0";
        globalResetBtn.style.pointerEvents = "none";
        setTimeout(() => (globalResetBtn.style.display = "none"), 200);
      }
      if (ctaGlobal) {
        Object.assign(ctaGlobal.style, {
          opacity: "0",
          pointerEvents: "none",
          height: "0",
          paddingTop: "0",
          paddingBottom: "0",
        });
        ctaGlobal.classList.remove("has-shown");
      }
      
      questions.forEach((item) => {
        Object.assign(item.style, {
          display: "none",
          visibility: "hidden",
          opacity: "0",
        });
      });
      
      // Reset suggested questions container styles from animation
      if (suggestedQuestions) {
        suggestedQuestions.style.height = "auto";
        suggestedQuestions.style.paddingTop = "";
        suggestedQuestions.style.paddingBottom = "";
        suggestedQuestions.style.marginTop = "";
        suggestedQuestions.style.overflow = "";
        suggestedQuestions.style.opacity = "1";
      }
      
      isTypingActive = false;
      isCategoryActive = false;
      isConversationStarted = false;
      firstAnswerShown = false;
      updateSuggestedQuestionsClass();
    }


    if (input) {
      const handleInputChange = () => {
        if (isProgrammaticChange) return;
        const value = input.value;
        const trimmedValue = value.trim();
        const hasText = trimmedValue.length > 0;

        if (globalResetBtn) {
          if (value.length > 0) {
            globalResetBtn.style.display = "block";
            globalResetBtn.style.opacity = "1";
            globalResetBtn.style.pointerEvents = "auto";
          } else {
            globalResetBtn.style.opacity = "0";
            globalResetBtn.style.pointerEvents = "none";
            setTimeout(() => (globalResetBtn.style.display = "none"), 200);
          }
        }

        const wasTyping = isTypingActive;
        isTypingActive = hasText;
        if (hasText && !wasTyping) {
          if (iconReload) iconReload.style.display = "block";
          if (iconClose) iconClose.style.display = "none";
        } else if (!hasText && wasTyping && !input.classList.contains("conversation-started")) {
          if (iconReload) iconReload.style.display = "none";
          if (iconClose) iconClose.style.display = "block";
        }

        let matchCount = 0;
        if (hasText) {
          matchCount = filterQuestionsByKeyword(trimmedValue);
        } else {
          resetToDefaultView();
          if (hintEl) {
            hintEl.textContent = "";
            hintEl.style.opacity = "0";
          }
        }

        const shouldShowSubmit = trimmedValue.length >= 5 && matchCount === 0;
        if (submitBtn) {
          if (shouldShowSubmit) {
            submitBtn.disabled = false;
            submitBtn.style.display = "inline-block";
            requestAnimationFrame(() => (submitBtn.style.opacity = "1"));
          } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0";
            setTimeout(() => (submitBtn.style.display = "none"), 200);
          }
        }
      };
      input.addEventListener("input", () => {
        handleInputChange();
        autoResizeTextarea(input);
      });
      input.addEventListener("keyup", () => {
        handleInputChange();
        autoResizeTextarea(input);
      });
    }

    const ZAPIER_URL = "https://hooks.zapier.com/hooks/catch/7023140/u5svqi0/";
    async function sendToZapier(intentValue) {
      const params = new URLSearchParams({
        intent: intentValue,
        timestamp: new Date().toISOString(),
        source: "Everday Webflow Chat Form",
      });
      try {
        await fetch(ZAPIER_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: params.toString(),
          keepalive: true,
        });
      } catch (err) {}
    }

    function showThinkingState() {
      if (!statusLine) return;
      statusLine.style.visibility = "visible";
      statusLine.style.opacity = "1";
      if (loadingEl) {
        loadingEl.style.visibility = "visible";
        gsap.to(loadingEl, { opacity: 1, duration: 0.3 });
      }
      const message = "Everday is thinking...";
      statusLine.textContent = "";
      gsap.to({}, {
        duration: Math.max(message.length * 0.04, 0.01),
        onUpdate: function () {
          const progress = this.progress();
          statusLine.textContent = message.substring(0, Math.floor(progress * message.length));
        },
      });
    }

    async function handleSubmitFlow() {
      const value = input.value.trim();
      if (!value) return;
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0";
      setTimeout(() => (submitBtn.style.display = "none"), 200);
      
      if (hintEl) {
        hintEl.textContent = "";
        hintEl.style.opacity = "0";
      }
      
      await sendToZapier(value);
      showThinkingState();
      setTimeout(() => {
        if (loadingEl) gsap.to(loadingEl, { opacity: 0, duration: 0.3 });
        if (statusLine) gsap.to(statusLine, { opacity: 0, duration: 0.3 });
        window.location.href = "https://onboarding.ever.day/organisation";
      }, 1500);
    }

    submitBtn.addEventListener("click", () => {
      handleSubmitFlow();
    });

    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmitFlow();
        }
      });
    }

    const getCatSlugFromBtn = (btn) =>
      btn.getAttribute("data-cat") || btn.querySelector(".cat-slug")?.textContent.trim() || "";
    const getQTopicSlug = (item) =>
      item.querySelector(".qa-topic-slug")?.textContent.trim() || "";

    let currentTypingAnimation = null;

    function processNameMarkers(text) {
      // Replace *name* with <span style="color: #FFBA00">name</span>
      return text.replace(/\*([^*]+)\*/g, '<span style="color: #FFBA00">$1</span>');
    }

    function getVisibleHTML(html, visibleLength) {
      // Create a temporary container to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;
      
      // Recursively truncate nodes while preserving HTML structure
      let currentLength = 0;
      const truncateNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const start = currentLength;
          const end = currentLength + text.length;
          
          if (end <= visibleLength) {
            // Include full text
            currentLength = end;
            return node.cloneNode(true);
          } else if (start < visibleLength) {
            // Include partial text
            const partialText = text.substring(0, visibleLength - start);
            currentLength = visibleLength;
            return document.createTextNode(partialText);
          } else {
            // Beyond visible length
            return null;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Clone element without children
          const cloned = node.cloneNode(false);
          // Process children
          for (const child of Array.from(node.childNodes)) {
            const truncated = truncateNode(child);
            if (truncated !== null) {
              cloned.appendChild(truncated);
            } else {
              // Stop if we've reached the visible length
              break;
            }
          }
          return cloned;
        }
        return null;
      };
      
      // Process all top-level nodes
      const result = document.createElement('div');
      for (const child of Array.from(temp.childNodes)) {
        const truncated = truncateNode(child);
        if (truncated !== null) {
          result.appendChild(truncated);
        } else {
          break;
        }
      }
      
      return result.innerHTML;
    }

    function typeAnswerText(el, text, speed = 0.02, done) {
      if (currentTypingAnimation) {
        currentTypingAnimation.kill();
      }
      
      // Process name markers to HTML
      const htmlText = processNameMarkers(text);
      el.innerHTML = "";
      
      currentTypingAnimation = gsap.to({}, {
        duration: Math.max(text.length * speed, 0.1),
        onUpdate: function () {
          const visibleLength = Math.floor(this.progress() * text.length);
          // Get the HTML version up to the visible length
          const visibleHTML = getVisibleHTML(htmlText, visibleLength);
          el.innerHTML = visibleHTML;
        },
        onComplete: () => {
          // Ensure full HTML is set at the end
          el.innerHTML = htmlText;
          currentTypingAnimation = null;
          if (done) done();
        },
      });
      return currentTypingAnimation;
    }

    function renderAnswerFromItem(item) {
  if (qaBodyContainer) {
    const existingApiThink = qaBodyContainer.querySelector(".api-think");
    if (existingApiThink) existingApiThink.remove();
  }
  if (qaBody) {
    const existingRmWrap = qaBody.querySelector(".rm-wrap");
    if (existingRmWrap) existingRmWrap.remove();
  }
  
  const qaAnswerData = item.querySelector(".qa-answer-data");
  const html = qaAnswerData?.innerHTML?.trim() || "";
  if (!qaBody || !html) return;

  const collectionItem = item.closest(".w-dyn-item");
  
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  let richMediaData = null;
  
  if (collectionItem) {
    let richMediaEl = collectionItem.querySelector(".rich-media-answer");
    
    if (!richMediaEl) {
      const rmImg = collectionItem.querySelector(".rm-img, [class*='rm-img']");
      const hasValidImg = rmImg && (rmImg.tagName === "IMG" ? rmImg.src && rmImg.src.trim() !== "" : rmImg.textContent.trim() !== "");
      
      if (hasValidImg) {
        const rmName = collectionItem.querySelector(".rm-name, [class*='rm-name']");
        const rmRole = collectionItem.querySelector(".rm-role, [class*='rm-role']");
        const rmSkill = collectionItem.querySelector(".rm-skill, [class*='rm-skill']");
        const rmSkillNumber = collectionItem.querySelector(".rm-skill-number, [class*='rm-skill-number']");
        const rmSkillMatch = collectionItem.querySelector(".rm-skill-match, [class*='rm-skill-match']");
        
        richMediaData = {
          img: rmImg,
          name: rmName,
          role: rmRole,
          skill: rmSkill,
          skillNumber: rmSkillNumber,
          skillMatch: rmSkillMatch
        };
        console.log("✅ Rich media fields found in collection item");
      }
    } else {
      const rmImgInEl = richMediaEl.querySelector(".rm-img");
      const hasValidImg = rmImgInEl && (rmImgInEl.tagName === "IMG" ? rmImgInEl.src && rmImgInEl.src.trim() !== "" : rmImgInEl.textContent.trim() !== "");
      
      if (hasValidImg) {
        richMediaData = { element: richMediaEl };
        console.log("✅ Rich media element found");
      }
    }
  }

  tempDiv.querySelector(".chat-disclaimer-and-cta")?.remove();

  const richMediaInAnswer = tempDiv.querySelector(".rich-media-answer");
  if (richMediaInAnswer) {
    richMediaInAnswer.remove();
  }
  
  tempDiv.querySelectorAll(".rm-img, .rm-name, .rm-role, .rm-skill, .rm-skill-number, .rm-skill-match, .rm-match-wrap, .employee-info").forEach(el => el.remove());
  
  tempDiv.querySelectorAll(".everday-thought, .api-icon1, .api-icon2, .api-icon3, .api-think, .api-icons-wrap").forEach(el => el.remove());

  const text = tempDiv.textContent || tempDiv.innerText || "";

  let apiIcon1 = null;
  let apiIcon2 = null;
  let apiIcon3 = null;
  let everdayThoughtText = null;
  
  if (collectionItem) {
    apiIcon1 = collectionItem.querySelector(".api-icon1");
    apiIcon2 = collectionItem.querySelector(".api-icon2");
    apiIcon3 = collectionItem.querySelector(".api-icon3");
    
    everdayThoughtText = collectionItem.querySelector(".everday-thought")?.textContent.trim();
  }

  answerBox.style.opacity = "1";
  answerBox.classList.remove("is-active");
  answerBox.classList.add("is-active");
  if (qaBody) {
    qaBody.innerHTML = "";
    qaBody.style.opacity = "0";
    qaBody.style.display = "none";
  }

  function startAnimationSequence() {
    if (apiIcon1 || apiIcon2 || apiIcon3 || everdayThoughtText) {
      const apiThinkContainer = document.createElement("div");
      apiThinkContainer.className = "api-think";
      
      if (apiIcon1 || apiIcon2 || apiIcon3) {
        const apiIconsWrap = document.createElement("div");
        apiIconsWrap.className = "api-icons-wrap";
        
        const icons = [];
        if (apiIcon1) {
          const icon1Clone = apiIcon1.cloneNode(true);
          icon1Clone.style.opacity = "0";
          apiIconsWrap.appendChild(icon1Clone);
          icons.push(icon1Clone);
        }
        if (apiIcon2) {
          const icon2Clone = apiIcon2.cloneNode(true);
          icon2Clone.style.opacity = "0";
          apiIconsWrap.appendChild(icon2Clone);
          icons.push(icon2Clone);
        }
        if (apiIcon3) {
          const icon3Clone = apiIcon3.cloneNode(true);
          icon3Clone.style.opacity = "0";
          apiIconsWrap.appendChild(icon3Clone);
          icons.push(icon3Clone);
        }
        
        apiThinkContainer.appendChild(apiIconsWrap);
        
        setTimeout(() => {
          icons.forEach((icon, index) => {
            setTimeout(() => {
              gsap.to(icon, { opacity: 1, duration: 0.5 });
            }, index * 200);
          });
        }, 320);
      }
      
      let everdayThoughtPara = null;
      if (everdayThoughtText) {
        everdayThoughtPara = document.createElement("p");
        everdayThoughtPara.className = "everday-thought";
        everdayThoughtPara.textContent = everdayThoughtText;
        everdayThoughtPara.style.opacity = "0";
        apiThinkContainer.appendChild(everdayThoughtPara);
      }
      
      if (qaBodyContainer && qaBody) {
        qaBodyContainer.insertBefore(apiThinkContainer, qaBody);
      } else if (qaBodyContainer) {
        qaBodyContainer.appendChild(apiThinkContainer);
      }
      
      const iconCount = (apiIcon1 ? 1 : 0) + (apiIcon2 ? 1 : 0) + (apiIcon3 ? 1 : 0);
      const iconsFadeInTime = iconCount * 200 + 240;
      
      if (everdayThoughtPara) {
        setTimeout(() => {
          gsap.to(everdayThoughtPara, { opacity: 1, duration: 0.5 });
        }, iconsFadeInTime);
      }
      
      const thoughtFadeInTime = everdayThoughtPara ? iconsFadeInTime + 500 : iconsFadeInTime;
      setTimeout(() => {
        startAnswerTyping();
      }, thoughtFadeInTime + 300);
    } else {
      startAnswerTyping();
    }
    
    function startAnswerTyping() {
      if (qaBody) {
        qaBody.style.display = "flex";
        gsap.to(qaBody, { opacity: 1, duration: 0.5 });
      }
      
      const answerTextContainer = document.createElement("div");
      answerTextContainer.className = "answer-text-container";
      qaBody.appendChild(answerTextContainer);
      
      typeAnswerText(answerTextContainer, text, 0.02, () => {
        showRichMedia();
      });
    }
    
    function showRichMedia() {
    if (richMediaData) {
      console.log("✅ Injecting rich media into qa-body");
      
      const richMediaContainer = document.createElement("div");
      richMediaContainer.className = "rich-media-answer";

      let rmImg, rmName, rmRole, rmSkill, rmSkillNumber, rmSkillMatch;

      if (richMediaData.element) {
        const richMediaEl = richMediaData.element;
        rmImg = richMediaEl.querySelector(".rm-img")?.cloneNode(true);
        rmName = richMediaEl.querySelector(".rm-name")?.cloneNode(true);
        rmRole = richMediaEl.querySelector(".rm-role")?.cloneNode(true);
        rmSkill = richMediaEl.querySelector(".rm-skill")?.cloneNode(true);
        rmSkillNumber = richMediaEl.querySelector(".rm-skill-number");
        rmSkillMatch = richMediaEl.querySelector(".rm-skill-match");
      } else {
        rmImg = richMediaData.img?.cloneNode(true);
        rmName = richMediaData.name?.cloneNode(true);
        rmRole = richMediaData.role?.cloneNode(true);
        rmSkill = richMediaData.skill?.cloneNode(true);
        rmSkillNumber = richMediaData.skillNumber;
        rmSkillMatch = richMediaData.skillMatch;
      }
      
      if (!rmImg) {
        console.log("ℹ️ No .rm-img found, skipping rich media injection");
        return;
      }
      
      const hasImgContent = rmImg.tagName === "IMG" 
        ? (rmImg.src && rmImg.src.trim() !== "" && !rmImg.src.includes("placeholder"))
        : (rmImg.textContent && rmImg.textContent.trim() !== "");
      
      if (!hasImgContent) {
        console.log("ℹ️ .rm-img exists but has no content, skipping rich media injection");
        return;
      }
      
      let personWrap = null;
      if (rmImg || rmName || rmRole) {
        personWrap = document.createElement("div");
        personWrap.className = "rm-person-wrap";
        
        if (rmImg) personWrap.appendChild(rmImg);
        
        if (rmName || rmRole) {
          const employeeInfo = document.createElement("div");
          employeeInfo.className = "employee-info";
          
          if (rmName) employeeInfo.appendChild(rmName);
          if (rmRole) employeeInfo.appendChild(rmRole);
          
          personWrap.appendChild(employeeInfo);
        }
      }

      let skillCont = null;
      if (rmSkill || rmSkillNumber || rmSkillMatch) {
        skillCont = document.createElement("div");
        skillCont.className = "rm-skill-cont";
        
        if (rmSkill) {
          skillCont.appendChild(rmSkill);
        }
        
        let matchWrap = null;
        if (rmSkillNumber || rmSkillMatch) {
          matchWrap = document.createElement("div");
          matchWrap.className = "rm-match-wrap";
          
          if (rmSkillNumber) {
            matchWrap.appendChild(rmSkillNumber.cloneNode(true));
          }
          if (rmSkillMatch) {
            matchWrap.appendChild(rmSkillMatch.cloneNode(true));
          }
          
          if (matchWrap.children.length > 0) {
            skillCont.appendChild(matchWrap);
          }
        }
      }

      if (personWrap && personWrap.children.length > 0) richMediaContainer.appendChild(personWrap);
      if (skillCont && skillCont.children.length > 0) richMediaContainer.appendChild(skillCont);

      if (richMediaContainer.children.length > 0) {
        const rmWrap = document.createElement("div");
        rmWrap.className = "rm-wrap";
        rmWrap.appendChild(richMediaContainer);
        
        if (qaBody) {
          qaBody.appendChild(rmWrap);
          console.log("✅ Rich media appended to .rm-wrap inside qa-body");
        }
        
        setTimeout(() => {
          checkAndFixRichMediaOverlap(richMediaContainer);
        }, 50);
        
        gsap.fromTo(richMediaContainer, { opacity: 0, y: 10 }, { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          onComplete: () => {
            setTimeout(() => {
              checkAndFixRichMediaOverlap(richMediaContainer);
            }, 100);
          }
        });
      } else {
        console.log("⚠️ Rich media container is empty, skipping");
      }
    } else {
      console.log("ℹ️ No rich media data found for this item");
    }

      if (ctaGlobal && !ctaGlobal.classList.contains("has-shown")) {
        setTimeout(() => {
          Object.assign(ctaGlobal.style, {
            opacity: "1",
            pointerEvents: "auto",
            height: "auto",
            paddingTop: "1rem",
            paddingBottom: "0.5rem",
          });
          ctaGlobal.classList.add("has-shown");
        }, 1500);
      }
    }
  }
  
  startAnimationSequence();

  if (!firstAnswerShown) {
    answerBox.classList.add("fade-in");
    firstAnswerShown = true;
  }
}

    function handlePredefinedQuestion(item) {
      const qText = item.querySelector(".question-text")?.textContent.trim() || "";
      if (!qText || !input) return;
      
      console.log("Question selected, showing modal close");
      
      isProgrammaticChange = true;
      input.value = qText;
      input.placeholder = "";
      
      if (input) {
        input.readOnly = true;
        input.disabled = false;
      }
      if (intentInput) {
        intentInput.value = qText;
        intentInput.readOnly = true;
        intentInput.disabled = false;
      }
      
      // Animate input to chat bubble style
      if (input) {
        gsap.to(input, {
          margin: "1rem",
          padding: "1rem",
          width: "80%",
          borderRadius: "0px 1rem 1rem 1rem",
          backgroundColor: "rgb(255, 255, 255)",
          border: "1px solid #A8A8A8",
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            input.classList.add("conversation-started");
            setTimeout(() => {
              autoResizeTextarea(input);
              setTimeout(() => autoResizeTextarea(input), 100);
            }, 50);
          }
        });
      }
      
      // Animate #intent to chat bubble style
      if (intentInput) {
        const isMobile = window.innerWidth <= 479;
        gsap.to(intentInput, {
          margin: "1rem",
          padding: "1rem",
          width: isMobile ? "85%" : "70%",
          borderRadius: "0px 1rem 1rem 1rem",
          backgroundColor: "rgb(255, 255, 255)",
          border: "1px solid #A8A8A8",
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            intentInput.classList.add("conversation-started");
            setTimeout(() => {
              autoResizeTextarea(intentInput);
              setTimeout(() => autoResizeTextarea(intentInput), 100);
            }, 50);
          }
        });
      }
      
      if (hintEl) {
        hintEl.textContent = "";
        hintEl.style.opacity = "0";
      }
      
      // Close the category modal when a question is selected with smooth fade-out and height collapse
      isCategoryActive = false;
      
      // Create a timeline for synchronized animations with a small delay
      const closeTimeline = gsap.timeline({
        delay: 0.15,
        onComplete: () => {
          // Clean up after animations complete
          if (suggestedQuestions) {
            suggestedQuestions.style.height = "auto";
            suggestedQuestions.style.paddingTop = "";
            suggestedQuestions.style.paddingBottom = "";
            suggestedQuestions.style.marginTop = "";
            suggestedQuestions.style.overflow = "";
          }
          if (modalCloseBtn) {
            modalCloseBtn.style.display = "none";
            modalCloseBtn.style.opacity = "1";
          }
          questions.forEach((item) => {
            Object.assign(item.style, { display: "none", visibility: "hidden", opacity: "0" });
          });
          updateSuggestedQuestionsClass();
          
          // Show categories container after cleanup
          if (categoriesContainer) categoriesContainer.style.display = "flex";
          categories.forEach((btn) => {
            btn.style.display = "block";
            btn.style.pointerEvents = "auto";
            btn.classList.remove("is-active");
          });
        }
      });
      
      // Collapse the suggested questions container from bottom up (height to 0)
      if (suggestedQuestions && suggestedQuestions.classList.contains("is-open")) {
        const currentHeight = suggestedQuestions.offsetHeight;
        // Set overflow hidden and explicit height for smooth collapse
        suggestedQuestions.style.overflow = "hidden";
        suggestedQuestions.style.height = currentHeight + "px";
        // Force reflow
        void suggestedQuestions.offsetHeight;
        
        closeTimeline.to(suggestedQuestions, {
          height: 0,
          opacity: 0,
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          duration: 0.35,
          ease: "power1.inOut"
        }, 0);
      } else {
        updateSuggestedQuestionsClass();
      }
      
      // Fade out modal close button simultaneously
      if (modalCloseBtn && modalCloseBtn.style.display !== "none") {
        closeTimeline.to(modalCloseBtn, {
          opacity: 0,
          duration: 0.35,
          ease: "power1.inOut"
        }, 0);
      } else {
        if (modalCloseBtn) {
          modalCloseBtn.style.display = "none";
          modalCloseBtn.style.opacity = "1";
        }
      }
      
      // Fade out all questions simultaneously
      questions.forEach((item) => {
        closeTimeline.to(item, {
          opacity: 0,
          duration: 0.3,
          ease: "power1.inOut"
        }, 0);
      });
      
      if (globalResetBtn) {
        globalResetBtn.style.display = "block";
        globalResetBtn.style.opacity = "1";
        globalResetBtn.style.pointerEvents = "auto";
      }
      
      if (iconReload) iconReload.style.display = "block";
      
      setTimeout(() => (isProgrammaticChange = false), 100);
      renderAnswerFromItem(item);
      submitBtn.style.opacity = "0";
      setTimeout(() => (submitBtn.style.display = "none"), 200);
    }

    function filterQuestionsToTopic(slug) {
      if (!slug) return;
      isCategoryActive = true;
      
      // Reset all questions first to ensure they're properly visible
      questions.forEach((item) => {
        const match = getQTopicSlug(item) === slug;
        if (match) {
          // Reset styles to ensure visibility
          Object.assign(item.style, {
            display: "block",
            visibility: "visible",
            opacity: "1",
            pointerEvents: "auto"
          });
        } else {
          Object.assign(item.style, {
            display: "none",
            visibility: "hidden",
            opacity: "0"
          });
        }
      });
      
      // Ensure modal close button is visible and reset
      if (modalCloseBtn) {
        modalCloseBtn.style.display = "block";
        modalCloseBtn.style.opacity = "1";
        modalCloseBtn.style.pointerEvents = "auto";
      }
      
      // Ensure suggested questions container is reset
      if (suggestedQuestions) {
        suggestedQuestions.style.height = "auto";
        suggestedQuestions.style.paddingTop = "";
        suggestedQuestions.style.paddingBottom = "";
        suggestedQuestions.style.marginTop = "";
        suggestedQuestions.style.overflow = "";
        suggestedQuestions.style.opacity = "1";
      }
      
      updateSuggestedQuestionsClass();
    }

    questions.forEach((item) => {
      const qText = item.querySelector(".question-text")?.textContent.trim() || "";
      item.addEventListener("mouseenter", () => {
        if (input && qText && !isConversationStarted) input.placeholder = qText;
      });
      item.addEventListener("mouseleave", () => {
        if (input && !isConversationStarted) input.placeholder = defaultPlaceholder;
      });
      item.addEventListener("click", () => {
        handlePredefinedQuestion(item);
      });
    });

    categories.forEach((btn) => {
      btn.addEventListener("click", () => {
        const slug = getCatSlugFromBtn(btn);
        if (!slug) return;
        
        isCategoryActive = true;
        isTypingActive = false;
        
        categories.forEach((b) => {
          b.style.display = "none";
          b.classList.remove("is-active");
        });
        
        btn.style.display = "block";
        btn.classList.add("is-active");
        
        if (categoriesContainer) categoriesContainer.style.display = "block";
        
        if (modalCloseBtn) modalCloseBtn.style.display = "block";
        if (iconReload) iconReload.style.display = "none";
        
        filterQuestionsToTopic(slug);
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
        isCategoryActive = false;
        
        if (categoriesContainer) categoriesContainer.style.display = "flex";
        categories.forEach((btn) => {
          btn.style.display = "block";
          btn.style.pointerEvents = "auto";
          btn.classList.remove("is-active");
        });
        
        questions.forEach((item) => {
          Object.assign(item.style, { display: "none", visibility: "hidden", opacity: "0" });
        });
        
        if (modalCloseBtn) modalCloseBtn.style.display = "none";
        updateSuggestedQuestionsClass();
      });
    }

    if (globalResetBtn) {
      globalResetBtn.addEventListener("click", () => {
        resetTextAreas();
        if (categoriesContainer) categoriesContainer.style.display = "flex";
        categories.forEach((btn) => {
          btn.style.display = "block";
          btn.classList.remove("is-active");
        });
        questions.forEach((item) => {
          Object.assign(item.style, { display: "none", visibility: "hidden", opacity: "0" });
        });
        if (iconReload) iconReload.style.display = "none";
        if (iconClose) iconClose.style.display = "block";
        if (modalCloseBtn) modalCloseBtn.style.display = "none";
        updateSuggestedQuestionsClass();
      });
    }
  })();
});

