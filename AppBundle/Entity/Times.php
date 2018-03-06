<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="vt_times")
 * @ORM\HasLifecycleCallbacks
 */
class Times{
	/**
	 * @ORM\Column(type="integer")
	 * @ORM\Id;
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;
	/**
	 * @ORM\Column(type="integer")
	 */
	private $mapId;
	/**
	 * @ORM\Column(type="datetime", nullable=true)
	 */
	private $createdAt;
	/**
	 * @ORM\Column(type="integer")
	 */
	private $playerId;
    /**
     * @ORM\Column(type="float", nullable=true)
     */
    private $finishTime;
	/**
	 * @ORM\Column(type="simple_array", nullable=true)
	 */
	private $checkpointTimes;


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
     * Set mapId
     *
     * @param integer $mapId
     *
     * @return Times
     */
    public function setMapId($mapId)
    {
        $this->mapId = $mapId;

        return $this;
    }

    /**
     * Get mapId
     *
     * @return integer
     */
    public function getMapId()
    {
        return $this->mapId;
    }

    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return Times
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Set playerId
     *
     * @param integer $playerId
     *
     * @return Times
     */
    public function setPlayerId($playerId)
    {
        $this->playerId = $playerId;

        return $this;
    }

    /**
     * Get playerId
     *
     * @return integer
     */
    public function getPlayerId()
    {
        return $this->playerId;
    }

    /**
     * Set finishTime
     *
     * @param float $finishTime
     *
     * @return Times
     */
    public function setFinishTime($finishTime)
    {
        $this->finishTime = $finishTime;

        return $this;
    }

    /**
     * Get finishTime
     *
     * @return float
     */
    public function getFinishTime()
    {
        return $this->finishTime;
    }

    /**
     * Set checkpointTimes
     *
     * @param array $checkpointTimes
     *
     * @return Times
     */
    public function setCheckpointTimes($checkpointTimes)
    {
        $this->checkpointTimes = $checkpointTimes;
        return $this;
    }

    /**
     * Get checkpointTimes
     *
     * @return array
     */
    public function getCheckpointTimes()
    {
        return $this->checkpointTimes;
    }

    /**
     * Triggered on update
     * @ORM\PreUpdate
     * @ORM\PrePersist
     */
    public function onPreUpdate()
    {
        $this->createdAt = new \DateTime('now');
    }
}