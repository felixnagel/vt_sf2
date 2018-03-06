<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="vt_map")
 */
class Map{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id;
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;
	/**
	 * @ORM\Column(type="string", nullable=true)
	 */
	private $title;
	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $releasedAt;
	/**
	 * @ORM\Column(type="integer")
	 */
	private $createdBy;
	/**
	 * @ORM\Column(type="text", nullable=true)
	 */
	private $blocks;


    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
     *
     * @param string $title
     *
     * @return Map
     */
    public function setTitle($title = null)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set releasedAt
     *
     * @param \DateTime $releasedAt
     *
     * @return Map
     */
    public function setReleasedAt($releasedAt)
    {
        $this->releasedAt = $releasedAt;

        return $this;
    }

    /**
     * Get releasedAt
     *
     * @return \DateTime
     */
    public function getReleasedAt()
    {
        return $this->releasedAt;
    }

    /**
     * Set createdBy
     *
     * @param integer $createdBy
     *
     * @return Map
     */
    public function setCreatedBy($createdBy)
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    /**
     * Get createdBy
     *
     * @return integer
     */
    public function getCreatedBy()
    {
        return $this->createdBy;
    }

    /**
     * Set blocks
     *
     * @param string $blocks
     *
     * @return Map
     */
    public function setBlocks($blocks)
    {
        $this->blocks = $blocks;

        return $this;
    }

    /**
     * Get blocks
     *
     * @return string
     */
    public function getBlocks()
    {
        return $this->blocks;
    }
}
