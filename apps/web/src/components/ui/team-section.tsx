import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users } from "lucide-react";

export default function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const teamMembers = [
    {
      name: "Aditya Surana",
      designation: "Co-Founder & CEO",
      description: "IIT BHU Physics graduate with a passion for revolutionizing information discovery through AI.",
      secondLine: "Leading product vision, strategic partnerships, and driving the future of intelligent search technology.",
      thirdLine: "Previously worked on ML research projects and has deep expertise in search algorithms and user experience design.",
      image: "/headshot.png",
      twitter: "https://x.com/theadityasurana",
      linkedin: "https://www.linkedin.com/in/adityasurana7/"
    },
    {
      name: "Yashaswi Singhania",
      designation: "Co-Founder & CTO", 
      description: "IIT BHU graduate leading technical architecture and engineering excellence at Quantize.",
      secondLine: "Architecting scalable systems, overseeing product development, and driving technical innovation across the platform.",
      thirdLine: "Expert in full-stack development, system design, and building high-performance applications that scale.",
      image: "/yashaswi.png",
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/yashashwis/"
    },
    {
      name: "Subhash Kumar",
      designation: "Co-Founder & CMO",
      description: "IIT BHU graduate driving marketing strategy, brand positioning, and growth initiatives at Quantize.",
      secondLine: "Leading go-to-market strategies, user acquisition, and building strategic partnerships to expand market reach.",
      thirdLine: "Expert in digital marketing, brand development, and growth hacking with deep understanding of AI market dynamics.",
      image: "/subhash.png",
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/subhash-kumar-4641a9229/"
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 px-4 text-white relative"
    >
      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col items-center mb-16" variants={itemVariants}>
          <motion.span
            className="text-purple-400 font-medium mb-2 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Users className="w-4 h-4" />
            MEET OUR TEAM
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-center">The Minds Behind Quantize</h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.p className="text-center max-w-3xl mx-auto mb-16 text-white/80 text-lg leading-relaxed" variants={itemVariants}>
          Our team of passionate innovators from IIT BHU combines deep technical expertise with a shared vision to revolutionize information discovery. We're building the future of search through cutting-edge AI, making complex information accessible and actionable for everyone.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 group hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-32 h-32 rounded-full overflow-hidden mb-6 border-3 border-purple-400/30 group-hover:border-purple-400/60 transition-colors duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-purple-400 font-semibold mb-4 text-lg">{member.designation}</p>
                
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-white/85 leading-relaxed">
                    {member.description}
                  </p>
                  <p className="text-sm text-white/75 leading-relaxed">
                    {member.secondLine}
                  </p>
                  <p className="text-xs text-white/65 leading-relaxed">
                    {member.thirdLine}
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <motion.a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </motion.a>
                  <motion.a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}